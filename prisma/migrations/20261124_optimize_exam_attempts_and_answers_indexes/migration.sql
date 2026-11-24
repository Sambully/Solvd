-- Database Indexing Optimization for Exam Attempts and Answers

-- 1. Ensure attempt_id is primary key (already enforced by exam_attempts_pkey)

-- 2. Create index on (user_id, exam_id) for fast user attempt lookups across all statuses
CREATE INDEX IF NOT EXISTS "idx_user_exam" ON "exam_attempts"("user_id", "exam_id");

-- 3. Composite index for active/in-progress attempt resume & restore
CREATE INDEX IF NOT EXISTS "idx_user_exam_status" ON "exam_attempts"("user_id", "exam_id", "status");

-- 4. Fast rolling 24-hour rate limit checks
CREATE INDEX IF NOT EXISTS "idx_user_started_at" ON "exam_attempts"("user_id", "started_at");

-- 5. Fast concurrent active exam checks
CREATE INDEX IF NOT EXISTS "idx_user_status" ON "exam_attempts"("user_id", "status");

-- 6. Server-authoritative timer expiry sweep
CREATE INDEX IF NOT EXISTS "idx_status_expires_at" ON "exam_attempts"("status", "expires_at");

-- 7. Answers: Unique index on (attempt_id, question_id) to prevent duplicate answers and speed up retrieval
CREATE UNIQUE INDEX IF NOT EXISTS "idx_attempt_question" ON "answers"("attempt_id", "question_id");

-- 8. Answers: Index on question_id
CREATE INDEX IF NOT EXISTS "idx_answer_question" ON "answers"("question_id");

-- 9. Clean up redundant index on answers(attempt_id) if it exists, since idx_attempt_question covers attempt_id prefix
DROP INDEX IF EXISTS "answers_attempt_id_idx";

-- 10. Legacy attempts table: index on (user_id, exam_id)
CREATE INDEX IF NOT EXISTS "attempts_userId_examId_idx" ON "attempts"("userId", "examId");
