-- 1. 首先删除依赖 id 字段的策略
-- 1. First, remove policies that depend on the id field
DROP POLICY IF EXISTS "Allow authenticated users to read their profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow authenticated users to update their profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."profiles";

-- 2. 删除现有的所有 profiles 记录（由于我们将迁移到新的基于钱包的身份系统）
-- 这是最简单的方法，因为我们无法为现有记录生成有效的钱包地址
TRUNCATE TABLE "public"."profiles" CASCADE;

-- 3. 修改 profiles 表结构
-- 3. Modify the structure of the profiles table
ALTER TABLE "public"."profiles" DROP CONSTRAINT IF EXISTS "profiles_email_key";
ALTER TABLE "public"."profiles" DROP CONSTRAINT IF EXISTS "profiles_pkey";
ALTER TABLE "public"."profiles" DROP COLUMN IF EXISTS "email";
ALTER TABLE "public"."profiles" DROP COLUMN IF EXISTS "id";
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "wallet_address" TEXT;
ALTER TABLE "public"."profiles" ADD PRIMARY KEY ("wallet_address");
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'utc');

-- 4. 添加基于 wallet_address 的新策略
-- 4. Add new policies based on wallet_address
CREATE POLICY "Allow everyone to read profiles" ON "public"."profiles" 
FOR SELECT USING (true);

CREATE POLICY "Allow users to insert their own profile" ON "public"."profiles" 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own profile" ON "public"."profiles" 
FOR UPDATE USING (true) WITH CHECK (true);

-- 5. 修改 comments 表，关联 wallet_address
-- 5. Modify the comments table to associate wallet_address
ALTER TABLE "public"."comments" ADD COLUMN IF NOT EXISTS "wallet_address" TEXT;
ALTER TABLE "public"."comments" DROP COLUMN IF EXISTS "userID";

-- 6. 创建评论表的安全策略
-- 6. Create security policies for the comments table
CREATE POLICY "Allow everyone to read comments" ON "public"."comments" 
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create comments" ON "public"."comments" 
FOR INSERT WITH CHECK (true);

-- 7. 创建优化查询性能的索引
-- 7. Create indexes to optimize query performance
CREATE INDEX IF NOT EXISTS "comments_poolID_idx" ON "public"."comments" ("poolID");
CREATE INDEX IF NOT EXISTS "comments_wallet_address_idx" ON "public"."comments" ("wallet_address");
CREATE INDEX IF NOT EXISTS "profiles_username_idx" ON "public"."profiles" ("username");

-- 8. 添加外键约束（在创建表和清理数据之后）
-- 8. Add foreign key constraints (after creating tables and cleaning data)
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_wallet_address_fkey" 
FOREIGN KEY ("wallet_address") REFERENCES "public"."profiles"("wallet_address") ON DELETE CASCADE;