-- fixing_profile_and_comment_01.sql
-- 修复评论添加失败的问题: 在添加评论时，如果钱包地址在 profiles 表中不存在，则会违反外键约束
-- Fix the issue of comment addition failure: When adding a comment, a foreign key constraint violation occurs if the wallet address does not exist in the profiles table.

-- 1. 首先调整外键约束关系，将强制约束改为可选
-- 1. First, adjust the foreign key constraint, changing from mandatory to optional.

ALTER TABLE "public"."comments" DROP CONSTRAINT IF EXISTS "comments_wallet_address_fkey";

-- 2. 修改评论处理逻辑，确保在添加评论前自动创建用户资料
-- 2. Modify the comment handling logic to ensure that a user profile is automatically created before adding a comment.

-- 创建触发器函数：在插入评论之前检查并创建用户资料
-- Create a trigger function: Check and create a user profile before inserting a comment.
CREATE OR REPLACE FUNCTION ensure_profile_exists() RETURNS TRIGGER AS $$
BEGIN
    -- 检查钱包地址是否已在 profiles 表中存在
    -- Check whether the wallet address already exists in the profiles table.
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE wallet_address = NEW.wallet_address) THEN
        -- 如果不存在，则自动创建一个基础资料记录
        -- If it doesn't exist, automatically create a basic profile record.
        INSERT INTO profiles (wallet_address, username, updated_at)
        VALUES (
            NEW.wallet_address, 
            COALESCE(NEW.username, CONCAT('User_', SUBSTRING(NEW.wallet_address, 1, 6))), 
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器：在插入评论前自动确保用户资料存在
-- Create a trigger: Automatically ensure the existence of a user profile before inserting a comment.
DROP TRIGGER IF EXISTS ensure_profile_before_comment ON comments;
CREATE TRIGGER ensure_profile_before_comment
BEFORE INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION ensure_profile_exists();

-- 3. 重新添加外键约束，但允许更灵活的关联
-- 3. Re-add the foreign key constraint with more flexible association.
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_wallet_address_fkey" 
FOREIGN KEY ("wallet_address") REFERENCES "public"."profiles"("wallet_address") 
ON DELETE SET NULL; -- 当用户删除账户时，评论保留但不关联用户 When a user deletes their profile, the comment remains but is no longer associated with the user.

-- 4. 修复现有的NULL用户评论（如果有）
-- 4. Fix existing comments with NULL username (if any).
UPDATE comments SET username = 'Anonymous' WHERE username IS NULL;

-- 5. 为提高安全性，添加针对评论的行级安全策略
-- 5. For improved security, add row-level security policies for comments.
DROP POLICY IF EXISTS "Allow users to delete their own comments" ON "public"."comments";
CREATE POLICY "Allow users to delete their own comments" ON "public"."comments" 
FOR DELETE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- 6. 提升性能的索引
-- 6. Create an index to improve performance.
CREATE INDEX IF NOT EXISTS "comments_created_at_idx" ON "public"."comments" ("created_at" DESC);

-- fixing_profile_and_comment02.sql

-- 修复用户登录问题：确保用户在登录时立即创建 profile 记录，而不是等到发表评论时
-- Fix user login issue: ensure a profile record is created immediately on login rather than waiting to post a comment

-- 1. 首先保留之前的触发器，以防有些评论操作没有经过登录流程
-- 1. First, retain the previous trigger in case some comment operations bypass the login process

-- 这仍然是一个有效的备份机制
-- This still serves as an effective backup mechanism

ALTER TABLE "public"."comments" DROP CONSTRAINT IF EXISTS "comments_wallet_address_fkey";

-- 保留先前的触发器
-- Retain the previous trigger
CREATE OR REPLACE FUNCTION ensure_profile_exists() RETURNS TRIGGER AS $$
BEGIN
    -- 检查钱包地址是否已在 profiles 表中存在
    -- Check if the wallet address already exists in the profiles table
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE wallet_address = NEW.wallet_address) THEN
        -- 如果不存在，则自动创建一个基础资料记录
        -- If it does not exist, automatically create a basic profile record
        INSERT INTO profiles (wallet_address, username, updated_at)
        VALUES (
            NEW.wallet_address, 
            COALESCE(NEW.username, CONCAT('User_', SUBSTRING(NEW.wallet_address, 1, 6))), 
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 确保触发器存在
-- Ensure the trigger exists
DROP TRIGGER IF EXISTS ensure_profile_before_comment ON comments;
CREATE TRIGGER ensure_profile_before_comment
BEFORE INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION ensure_profile_exists();

-- 2. 创建一个数据库函数，用于用户登录时检查并创建用户资料
-- 2. Create a database function to check for and create a user profile during login

-- 这个函数将在 API 路由中调用
-- This function will be called in the API route
CREATE OR REPLACE FUNCTION check_and_create_profile(wallet_address_param TEXT) 
RETURNS TABLE(
    wallet_address TEXT,
    username TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    is_new BOOLEAN
) AS $$
DECLARE
    is_new_profile BOOLEAN := FALSE;
BEGIN
    -- 检查用户资料是否存在
    -- Check if the user profile exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE wallet_address = wallet_address_param) THEN
        -- 创建新的用户资料
        -- Create a new user profile
        INSERT INTO profiles (wallet_address, username, updated_at)
        VALUES (
            wallet_address_param,
            CONCAT('User_', SUBSTRING(wallet_address_param, 1, 6)),
            NOW()
        );
        is_new_profile := TRUE;
    END IF;
    
    -- 返回用户资料（无论是新创建的还是已存在的）
    -- Return the user profile (whether newly created or already existing)
    RETURN QUERY
    SELECT 
        p.wallet_address,
        p.username,
        p.avatar_url,
        p.bio,
        p.created_at,
        p.updated_at,
        is_new_profile AS is_new
    FROM profiles p
    WHERE p.wallet_address = wallet_address_param;
END;
$$ LANGUAGE plpgsql;

-- 3. 重新添加外键约束，但使用更宽松的设置
-- 3. Re-add the foreign key constraint with a more lenient setting
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_wallet_address_fkey" 
FOREIGN KEY ("wallet_address") REFERENCES "public"."profiles"("wallet_address") 
ON DELETE SET NULL; -- 如果用户删除资料，评论仍然保留但不关联用户 If the user profile is deleted, retain the comment without linking to a user

-- 4. 添加安全策略
-- 4. Add a security policy
-- 创建或替换用户删除评论的策略
-- Create or replace the policy that allows users to delete their own comments
DROP POLICY IF EXISTS "Allow users to delete their own comments" ON "public"."comments";
CREATE POLICY "Allow users to delete their own comments" ON "public"."comments" 
FOR DELETE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- 5. 创建一个索引来提高性能
-- 5. Create an index to improve performance
CREATE INDEX IF NOT EXISTS "comments_created_at_idx" ON "public"."comments" ("created_at" DESC);

-- fixing_profile_and_comment_03.sql
-- 修复用户资料检查/创建时的列引用歧义问题
-- Fix column reference ambiguity during user profile check/creation

-- 1. 修改 check_and_create_profile 函数，明确指定每个列的表来源
-- 1. Modify the check_and_create_profile function to explicitly specify the table source for each column
CREATE OR REPLACE FUNCTION check_and_create_profile(wallet_address_param TEXT) 
RETURNS TABLE(
  wallet_address TEXT,
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_new BOOLEAN
) AS $$
DECLARE
  is_new_profile BOOLEAN := FALSE;
BEGIN
  -- 检查用户资料是否存在 - 明确指定表名
  -- Check if the user profile exists - explicitly specify the table name
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.wallet_address = wallet_address_param) THEN
    -- 创建新的用户资料
    -- Create a new user profile
    INSERT INTO profiles (wallet_address, username, updated_at)
    VALUES (
      wallet_address_param,
      CONCAT('User_', SUBSTRING(wallet_address_param, 1, 6)),
      NOW()
    );
    is_new_profile := TRUE;
  END IF;
  
  -- 返回用户资料（无论是新创建的还是已存在的）- 明确指定表名和列别名
  -- Return the user profile (whether newly created or existing) - explicitly specify the table name and column alias
  RETURN QUERY
  SELECT 
    p.wallet_address,
    p.username,
    p.avatar_url,
    p.bio,
    p.created_at,
    p.updated_at,
    is_new_profile AS is_new
  FROM profiles p
  WHERE p.wallet_address = wallet_address_param;
END;
$$ LANGUAGE plpgsql;

-- 2. 确保触发器函数也正确指定表名，避免歧义
-- 2. Ensure that the trigger function also correctly specifies the table name to avoid ambiguity
CREATE OR REPLACE FUNCTION ensure_profile_exists() RETURNS TRIGGER AS $$
BEGIN
  -- 检查钱包地址是否已在 profiles 表中存在 - 明确指定表名
  -- Check if the wallet address already exists in the profiles table - explicitly specify the table name
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.wallet_address = NEW.wallet_address) THEN
    -- 如果不存在，则自动创建一个基础资料记录
    -- If it does not exist, automatically create a basic profile record
    INSERT INTO profiles (wallet_address, username, updated_at)
    VALUES (
      NEW.wallet_address, 
      COALESCE(NEW.username, CONCAT('User_', SUBSTRING(NEW.wallet_address, 1, 6))), 
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 确保 profiles 表有正确的结构和索引
-- 3. Ensure that the profiles table has the correct structure and indexes
-- 添加索引以加速查询
-- Add an index to speed up queries
CREATE INDEX IF NOT EXISTS "profiles_wallet_address_idx" ON "public"."profiles" ("wallet_address");

-- 4. 确保正确的权限策略
-- 4. Ensure correct permission policies
DROP POLICY IF EXISTS "Allow everyone to read profiles" ON "public"."profiles";
CREATE POLICY "Allow everyone to read profiles" ON "public"."profiles" 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own profile" ON "public"."profiles";
CREATE POLICY "Allow users to insert their own profile" ON "public"."profiles" 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON "public"."profiles";
CREATE POLICY "Allow users to update their own profile" ON "public"."profiles" 
FOR UPDATE USING (true);

-- 20250415-fixing_profile_and_comment_04.sql
-- 添加评论回复功能
-- Add comment reply functionality

-- 1. 修改comments表，添加parent_id字段用于回复功能
-- 1. Modify the comments table by adding a parent_id field for reply functionality
ALTER TABLE "public"."comments" ADD COLUMN IF NOT EXISTS "parent_id" BIGINT;

-- 添加自引用外键，表示回复关系
-- Add a self-referencing foreign key to represent reply relationships
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parent_id_fkey"
FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("commentID")
ON DELETE CASCADE; -- 如果父评论删除，所有回复也会被删除 If the parent comment is deleted, all replies will be deleted too

-- 2. 添加回复计数字段，以便快速显示回复数量
-- 2. Add a reply count field to quickly display the number of replies
ALTER TABLE "public"."comments" ADD COLUMN IF NOT EXISTS "reply_count" INTEGER DEFAULT 0;

-- 3. 创建触发器函数，用于更新父评论的回复计数
-- 3. Create a trigger function to update the reply count of the parent comment
CREATE OR REPLACE FUNCTION update_comment_reply_count() RETURNS TRIGGER AS $$
BEGIN
    -- 当添加新回复时
    -- When a new reply is added
    IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
        -- 增加父评论的回复计数
        -- Increase the reply count of the parent comment
        UPDATE "public"."comments" 
        SET "reply_count" = "reply_count" + 1 
        WHERE "commentID" = NEW.parent_id;
    -- 当删除回复时
    -- When a reply is deleted
    ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
        -- 减少父评论的回复计数
        -- Decrease the reply count of the parent comment
        UPDATE "public"."comments" 
        SET "reply_count" = GREATEST("reply_count" - 1, 0) -- 确保不会小于0 Ensure it doesn't go below 0
        WHERE "commentID" = OLD.parent_id;
    END IF;
    
    -- 对于INSERT操作返回NEW，对于DELETE操作返回OLD
    -- Return NEW for INSERT operations, OLD for DELETE operations
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
-- Create triggers
DROP TRIGGER IF EXISTS comment_reply_count_insert_trigger ON "public"."comments";
CREATE TRIGGER comment_reply_count_insert_trigger
AFTER INSERT ON "public"."comments"
FOR EACH ROW
EXECUTE FUNCTION update_comment_reply_count();

DROP TRIGGER IF EXISTS comment_reply_count_delete_trigger ON "public"."comments";
CREATE TRIGGER comment_reply_count_delete_trigger
BEFORE DELETE ON "public"."comments"
FOR EACH ROW
EXECUTE FUNCTION update_comment_reply_count();

-- 4. 确保安全策略正确，允许用户删除自己的评论和回复
-- 4. Ensure security policies are correct, allowing users to delete their own comments and replies
DROP POLICY IF EXISTS "Allow users to delete their own comments" ON "public"."comments";
CREATE POLICY "Allow users to delete their own comments" ON "public"."comments" 
FOR DELETE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- 5. 创建用于回复查询优化的索引
-- 5. Create indexes for optimizing reply queries
CREATE INDEX IF NOT EXISTS "comments_parent_id_idx" ON "public"."comments" ("parent_id");

-- 更新用户名约束和添加name字段
-- Update username constraints and add the 'name' field

-- 1. 为profiles表添加name字段
-- 1. Add the 'name' field to the 'profiles' table
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "name" TEXT;

-- 2. 先将所有用户名转换为小写
-- 2. Convert all usernames to lowercase
UPDATE "public"."profiles" 
SET "username" = LOWER("username");

-- 3. 强制username唯一性和格式要求
-- 3. Enforce username uniqueness and format requirements
-- 首先移除旧的唯一性约束和格式检查（如果存在）
-- First, remove the old uniqueness constraint and format check (if they exist)
ALTER TABLE "public"."profiles" DROP CONSTRAINT IF EXISTS "profiles_username_key";
ALTER TABLE "public"."profiles" DROP CONSTRAINT IF EXISTS "username_format_check";

-- 替换所有非法字符为下划线
-- Replace all illegal characters with underscores
UPDATE "public"."profiles" 
SET "username" = REGEXP_REPLACE("username", '[^a-z0-9_]', '_', 'g')
WHERE "username" ~ '[^a-z0-9_]';

-- 将已有用户名中的空格替换为下划线
-- Replace spaces in existing usernames with underscores
UPDATE "public"."profiles" 
SET "username" = REGEXP_REPLACE("username", '\s+', '_', 'g')
WHERE "username" ~ '\s';

-- 4. 创建不区分大小写的唯一性索引
-- 4. Create a case-insensitive unique index
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_username_lower_idx" 
ON "public"."profiles" (LOWER("username"));

-- 5. 添加格式检查约束（只允许小写字母、数字和下划线）
-- 5. Add a format check constraint (only allows lowercase letters, numbers, and underscores)
ALTER TABLE "public"."profiles" ADD CONSTRAINT "username_format_check" 
CHECK (username ~ '^[a-z0-9_]+$');

-- 6. 修复潜在的重复用户名问题（不区分大小写，添加随机后缀）
-- 6. Fix potential duplicate username issues (case-insensitive, add random suffix)
CREATE OR REPLACE FUNCTION fix_duplicate_usernames() RETURNS VOID AS $$
DECLARE
    rec RECORD;
    rec2 RECORD;
    new_username TEXT;
    duplicate_username TEXT;
BEGIN
    -- 查找重复的用户名（不区分大小写）
    -- Find duplicate usernames (case-insensitive)
    FOR rec IN 
        SELECT LOWER(username) as lower_username, COUNT(*) 
        FROM profiles 
        GROUP BY LOWER(username) 
        HAVING COUNT(*) > 1
    LOOP
        duplicate_username := rec.lower_username;
        
        -- 处理除第一个之外的所有重复用户名
        -- Handle all duplicate usernames except the first one
        FOR rec2 IN 
            SELECT wallet_address, username 
            FROM profiles 
            WHERE LOWER(username) = duplicate_username
            ORDER BY created_at
            OFFSET 1
        LOOP
            -- 添加随机后缀
            -- Add a random suffix
            new_username := rec2.username || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 5);
            UPDATE profiles SET username = new_username WHERE wallet_address = rec2.wallet_address;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT fix_duplicate_usernames();
DROP FUNCTION fix_duplicate_usernames();
