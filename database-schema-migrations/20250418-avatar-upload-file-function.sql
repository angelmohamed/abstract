--20250418-avatar-upload-file-function.sql

-- 1. 启用 storage.objects 行级安全
-- 1. Enable Row Level Security for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. 允许任意客户端（anon key）上传到 user-profile-avatar 存储桶
-- 2. Allow any client (anon key) to upload to the user-profile-avatar bucket
CREATE POLICY allow_anon_insert_profile_avatar
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'user-profile-avatar');

-- 3. 允许客户端读取 user-profile-avatar 存储桶中的对象 URL
-- 3. Allow clients to read object URLs in the user-profile-avatar bucket
CREATE POLICY allow_anon_select_profile_avatar
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'user-profile-avatar');

-- 4. （可选）如果需要删除和更新操作也开放，同理添加对应策略
-- 4. (Optional) If delete and update operations also need to be open, add corresponding policies in the same way
CREATE POLICY allow_anon_delete_profile_avatar ON storage.objects FOR DELETE USING (bucket_id = 'user-profile-avatar');
CREATE POLICY allow_anon_update_profile_avatar ON storage.objects FOR UPDATE USING (bucket_id = 'user-profile-avatar');