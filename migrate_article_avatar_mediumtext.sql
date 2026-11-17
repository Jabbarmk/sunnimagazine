-- Author avatars are stored as base64 (authors.avatar is MEDIUMTEXT) and copied
-- into articles.avatar, which was TEXT (64KB). A photo larger than that makes
-- the article INSERT fail with "Data too long for column 'avatar'" -> HTTP 500.
ALTER TABLE `articles` MODIFY `avatar` MEDIUMTEXT NULL;
