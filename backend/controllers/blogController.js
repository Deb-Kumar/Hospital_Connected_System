const Blog = require('../models/Blog');

const SEED_BLOGS = [
  {
    title: '10 Essential Daily Habits for a Strong & Healthy Heart',
    category: 'Heart Health',
    desc: 'Simple lifestyle changes, dietary choices, and exercise routines recommended by senior cardiologists to reduce cardiovascular risk.',
    author: 'Dr. Ananya Sharma',
    role: 'Senior Cardiologist',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
    fullText: 'Cardiovascular health depends heavily on daily physical activity, balanced sodium intake, stress management, and routine ECG screenings. Walking 30 minutes daily reduces heart attack risks by up to 35%. Always prioritize low saturated fat intake and get lipid profile tests done annually past age 30.',
    status: 'PUBLISHED',
    showOnHome: true,
  },
  {
    title: 'Understanding Diabetes: Early Warning Signs & Glucose Management',
    category: 'Diabetes Awareness',
    desc: 'Recognizing early symptoms like frequent thirst, fatigue, and slow healing cuts, along with low-GI diet planning.',
    author: 'Dr. Alok Nath Ghosh',
    role: 'Consultant Endocrinologist',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
    fullText: 'Glycemic control through HbA1c monitoring every 3 months prevents microvascular renal and retinal complications. Learn how fiber-rich Indian meals and regular monitoring help stabilize blood sugar.',
    status: 'PUBLISHED',
    showOnHome: true,
  },
  {
    title: 'Childhood Immunization & Seasonal Disease Prevention',
    category: 'Child Care',
    desc: 'Complete vaccination checklist for infants and young children to safeguard against viral flu, measles, and dengue.',
    author: 'Dr. Meera Banerjee',
    role: 'Pediatric Specialist',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
    fullText: 'Timely vaccines build lifetime immunity. Ensure your child gets their booster doses on schedule and drinks boiled or filtered water during monsoon and flu seasons.',
    status: 'PUBLISHED',
    showOnHome: true,
  },
  {
    title: 'Preventing Chronic Joint & Back Pain in Work-From-Home Ergonomics',
    category: 'Orthopedics & Spine',
    desc: 'Senior orthopedic advice on posture alignment, lumbar support chairs, and daily stretching routines to prevent spondylitis.',
    author: 'Dr. Bikramjit Roy',
    role: 'Orthopedic Surgeon',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    fullText: 'Prolonged sitting compresses intervertebral discs. Take 5-minute micro-breaks every hour, position your monitor at eye level, and strengthen core muscles with pelvic tilt exercises.',
    status: 'PUBLISHED',
    showOnHome: false,
  },
  {
    title: 'First Aid & CPR Basics: What to Do Before the Ambulance Arrives',
    category: 'Emergency Care',
    desc: 'Life-saving first aid techniques for sudden cardiac arrest, severe choking, high fever convulsions, and burn injuries.',
    author: 'Dr. Rajesh Kumar Sen',
    role: 'Emergency & Trauma Specialist',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
    fullText: 'Immediate high-quality chest compressions at 100-120 bpm maintain cerebral oxygenation until ALS ambulance arrives. Always call 108 first before starting bystander CPR.',
    status: 'PUBLISHED',
    showOnHome: false,
  },
  {
    title: 'Boosting Natural Immunity: Clinical Guide to Vitamins & Minerals',
    category: 'Nutrition & Diet',
    desc: 'Evidence-based nutritional strategies incorporating Vitamin C, Zinc, Vitamin D3, and gut microbiome probiotics.',
    author: 'Dr. Sunita Dasgupta',
    role: 'Clinical Dietitian & Nutritionist',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600',
    fullText: '70% of human immune cells reside in the gut. Eat fermented foods, colorful anti-oxidant vegetables, and ensure 15 minutes of early morning sun exposure for natural Vitamin D synthesis.',
    status: 'PUBLISHED',
    showOnHome: false,
  }
];

// GET /api/blogs (All published blogs)
exports.getBlogs = async (req, res) => {
  try {
    let blogs = await Blog.find({ status: 'PUBLISHED' }).sort({ createdAt: -1 });
    
    // Auto-seed database if empty
    if (blogs.length === 0) {
      await Blog.insertMany(SEED_BLOGS);
      blogs = await Blog.find({ status: 'PUBLISHED' }).sort({ createdAt: -1 });
    }

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/blogs/home (Blogs flagged for Home Page display, limit 3)
exports.getHomeBlogs = async (req, res) => {
  try {
    let homeBlogs = await Blog.find({ status: 'PUBLISHED', showOnHome: true }).sort({ createdAt: -1 }).limit(3);
    
    // Fallback if none flagged
    if (homeBlogs.length === 0) {
      homeBlogs = await Blog.find({ status: 'PUBLISHED' }).sort({ createdAt: -1 }).limit(3);
    }
    
    // Auto-seed database if empty
    if (homeBlogs.length === 0) {
      await Blog.insertMany(SEED_BLOGS);
      homeBlogs = await Blog.find({ status: 'PUBLISHED', showOnHome: true }).sort({ createdAt: -1 }).limit(3);
    }

    res.json(homeBlogs);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/blogs/admin/all (Admin view all blogs including drafts & home status)
exports.getAllBlogsAdmin = async (req, res) => {
  try {
    let blogs = await Blog.find().sort({ createdAt: -1 });
    if (blogs.length === 0) {
      await Blog.insertMany(SEED_BLOGS);
      blogs = await Blog.find().sort({ createdAt: -1 });
    }
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/blogs/:id
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog article not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/blogs
exports.createBlog = async (req, res) => {
  try {
    const { title, category, desc, author, role, readTime, image, fullText, status, showOnHome, authorUserId } = req.body;
    if (!title || !desc || !fullText) {
      return res.status(400).json({ success: false, message: 'Title, summary description, and full article text are required' });
    }

    const newBlog = await Blog.create({
      title,
      category: category || 'General Health',
      desc,
      author: author || 'Brainware Medical Faculty',
      role: role || 'Clinical Specialist',
      readTime: readTime || '5 min read',
      image: image || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
      fullText,
      status: status || 'PUBLISHED',
      showOnHome: Boolean(showOnHome),
      authorUserId: authorUserId || '',
    });

    res.status(201).json({ success: true, message: 'Blog article created in database', blog: newBlog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBlog) return res.status(404).json({ success: false, message: 'Blog article not found' });
    res.json({ success: true, message: 'Blog updated successfully', blog: updatedBlog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/blogs/:id/toggle-home (Toggle Show on Home Page)
exports.toggleHomeStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog article not found' });

    blog.showOnHome = !blog.showOnHome;
    await blog.save();

    res.json({
      success: true,
      message: `Blog "${blog.title}" is now ${blog.showOnHome ? 'FEATURED on Home Page' : 'removed from Home Page'}`,
      showOnHome: blog.showOnHome,
      blog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Blog article not found' });
    res.json({ success: true, message: 'Blog article deleted from database' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/blogs/doctor/:authorUserId (Fetch doctor submitted blogs)
exports.getDoctorBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ authorUserId: req.params.authorUserId }).sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/blogs/doctor-create (Doctor submits new blog for Admin approval)
exports.createDoctorBlog = async (req, res) => {
  try {
    const { title, category, desc, author, role, readTime, image, fullText, authorUserId } = req.body;
    if (!title || !desc || !fullText) {
      return res.status(400).json({ success: false, message: 'Title, summary description, and full article text are required' });
    }

    const newBlog = await Blog.create({
      title,
      category: category || 'General Health',
      desc,
      author: author || 'Doctor Specialist',
      role: role || 'Clinical Specialist',
      readTime: readTime || '5 min read',
      image: image || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
      fullText,
      status: 'PENDING',
      authorUserId: authorUserId || '',
    });

    res.status(201).json({
      success: true,
      message: 'Blog submitted successfully! Awaiting Admin review and publication.',
      blog: newBlog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/blogs/:id/review (Admin confirms or rejects doctor blog)
exports.reviewBlog = async (req, res) => {
  try {
    const { status, rejectionReason, category, role, author } = req.body;
    if (!['PUBLISHED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be PUBLISHED or REJECTED.' });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog article not found' });

    blog.status = status;
    if (category) blog.category = category;
    if (role) blog.role = role;
    if (author) blog.author = author;

    if (status === 'REJECTED') {
      blog.rejectionReason = rejectionReason || 'Content did not meet hospital publication guidelines.';
    } else {
      blog.rejectionReason = '';
    }

    await blog.save();

    res.json({
      success: true,
      message: `Blog "${blog.title}" has been ${status === 'PUBLISHED' ? 'CONFIRMED & PUBLISHED' : 'REJECTED'}.`,
      blog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

