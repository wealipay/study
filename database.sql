-- 创建考试系统数据库表

-- 考试表
CREATE TABLE exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    passing_score INTEGER DEFAULT 60
);

-- 题目表
CREATE TABLE questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('fill_blank', 'multiple_choice', 'single_choice')),
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    correct_answer TEXT,
    options TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 考试会话表
CREATE TABLE exam_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    total_score INTEGER,
    max_score INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    answers JSONB DEFAULT '{}',
    time_remaining INTEGER
);

-- 用户答案表
CREATE TABLE user_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    selected_options TEXT[],
    is_correct BOOLEAN DEFAULT false,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_exams_created_by ON exams(created_by);
CREATE INDEX idx_exams_is_active ON exams(is_active);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_questions_order ON questions(exam_id, order_index);
CREATE INDEX idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX idx_exam_sessions_exam_id ON exam_sessions(exam_id);
CREATE INDEX idx_user_answers_session_id ON user_answers(session_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);

-- 触发器：自动更新考试总分
CREATE OR REPLACE FUNCTION update_exam_total_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE exams 
    SET total_points = (
        SELECT COALESCE(SUM(points), 0) 
        FROM questions 
        WHERE exam_id = COALESCE(NEW.exam_id, OLD.exam_id)
    )
    WHERE id = COALESCE(NEW.exam_id, OLD.exam_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_exam_total_points
    AFTER INSERT OR UPDATE OR DELETE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_exam_total_points();

-- RLS (Row Level Security) 政策
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- 考试表政策
CREATE POLICY "Everyone can view active exams" ON exams
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create their own exams" ON exams
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own exams" ON exams
    FOR UPDATE USING (auth.uid() = created_by);

-- 题目表政策
CREATE POLICY "Everyone can view questions for active exams" ON questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exams 
            WHERE exams.id = questions.exam_id 
            AND exams.is_active = true
        )
    );

CREATE POLICY "Exam creators can manage questions" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM exams 
            WHERE exams.id = questions.exam_id 
            AND exams.created_by = auth.uid()
        )
    );

-- 考试会话表政策
CREATE POLICY "Users can view their own exam sessions" ON exam_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exam sessions" ON exam_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exam sessions" ON exam_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 用户答案表政策
CREATE POLICY "Users can view their own answers" ON user_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exam_sessions 
            WHERE exam_sessions.id = user_answers.session_id 
            AND exam_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own answers" ON user_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM exam_sessions 
            WHERE exam_sessions.id = user_answers.session_id 
            AND exam_sessions.user_id = auth.uid()
        )
    );

-- 插入示例数据
INSERT INTO exams (title, description, duration_minutes, created_by, passing_score) VALUES 
('JavaScript 基础测试', '测试 JavaScript 基础知识，包括变量、函数、对象等概念', 30, '00000000-0000-0000-0000-000000000000', 70),
('数学基础练习', '基础数学运算和概念测试', 45, '00000000-0000-0000-0000-000000000000', 60),
('编程逻辑测试', '测试编程思维和逻辑能力', 60, '00000000-0000-0000-0000-000000000000', 75);

-- 获取刚插入的考试ID（这里用第一个考试作为示例）
DO $$
DECLARE
    exam_id_js UUID;
    exam_id_math UUID;
    exam_id_logic UUID;
BEGIN
    SELECT id INTO exam_id_js FROM exams WHERE title = 'JavaScript 基础测试';
    SELECT id INTO exam_id_math FROM exams WHERE title = '数学基础练习';
    SELECT id INTO exam_id_logic FROM exams WHERE title = '编程逻辑测试';
    
    -- JavaScript 考试题目
    INSERT INTO questions (exam_id, question_text, question_type, points, order_index, correct_answer, options) VALUES
    (exam_id_js, '在 JavaScript 中，______ 用于声明一个不可重新赋值的变量。', 'fill_blank', 5, 1, 'const', NULL),
    (exam_id_js, '以下哪些是 JavaScript 的基本数据类型？', 'multiple_choice', 10, 2, 'string,number,boolean', ARRAY['string', 'number', 'boolean', 'object', 'array']),
    (exam_id_js, 'JavaScript 中 == 和 === 的区别是什么？', 'single_choice', 5, 3, '=== 进行严格比较，== 进行类型转换后比较', ARRAY['=== 进行严格比较，== 进行类型转换后比较', '没有区别', '== 更严格', '=== 只比较值']),
    (exam_id_js, 'typeof null 的结果是 ______。', 'fill_blank', 5, 4, 'object', NULL);
    
    -- 数学考试题目
    INSERT INTO questions (exam_id, question_text, question_type, points, order_index, correct_answer, options) VALUES
    (exam_id_math, '2 + 3 × 4 = ______', 'fill_blank', 5, 1, '14', NULL),
    (exam_id_math, '以下哪个是质数？', 'single_choice', 5, 2, '17', ARRAY['15', '16', '17', '18']),
    (exam_id_math, '√16 = ______', 'fill_blank', 5, 3, '4', NULL),
    (exam_id_math, '以下哪些数字是偶数？', 'multiple_choice', 10, 4, '2,4,6', ARRAY['1', '2', '3', '4', '5', '6']);
    
    -- 编程逻辑考试题目
    INSERT INTO questions (exam_id, question_text, question_type, points, order_index, correct_answer, options) VALUES
    (exam_id_logic, '在冒泡排序算法中，最坏情况下的时间复杂度是 ______。', 'fill_blank', 10, 1, 'O(n²)', NULL),
    (exam_id_logic, '以下哪种数据结构遵循"先进先出"原则？', 'single_choice', 10, 2, '队列', ARRAY['栈', '队列', '数组', '链表']),
    (exam_id_logic, '递归算法必须具备哪些条件？', 'multiple_choice', 15, 3, '基础情况,递归调用', ARRAY['基础情况', '递归调用', '循环条件', '全局变量']);
END $$;