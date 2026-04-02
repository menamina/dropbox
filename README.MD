# Dropbox Clone File Storage System

## Functionality

- Upload, organize, and manage files in cloud storage with folder organization and trash functionality. Users must authenticate to access their personal file storage with full CRUD operations on both files and folders.

## Built with

- Node.js
- Express
- EJS
- Passport
- Multer
- Prisma ORM
- PostgreSQL

Building this

- I implemented Passport middleware for authentication. File uploads are handled through Multer. Prisma handles all database operations with PostgreSQL.

- I implemented soft delete functionality for both files and folders using a 'trashed' boolean flag in the database rather than hard deletes. This allows users to restore accidentally deleted items from the trash.

- The folder cascade delete relationship in Prisma ensures when a folder is permanently deleted, all associated files are automatically deleted as well from the database.
