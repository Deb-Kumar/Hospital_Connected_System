const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Public endpoints
router.get('/', blogController.getBlogs);
router.get('/home', blogController.getHomeBlogs);
router.get('/admin/all', blogController.getAllBlogsAdmin);
router.get('/:id', blogController.getBlogById);

// Admin/Faculty endpoints
router.post('/', blogController.createBlog);
router.put('/:id', blogController.updateBlog);
router.put('/:id/toggle-home', blogController.toggleHomeStatus);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
