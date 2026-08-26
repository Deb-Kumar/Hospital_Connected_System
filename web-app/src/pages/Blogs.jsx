import React, { useState, useEffect } from 'react';
import Navbar from '../components/Header/Navbar';
import Footer from '../components/Footer/Footer';
import axiosClient from '../api/axiosClient';
import FormattedArticleContent from '../components/FormattedArticleContent';

export default function Blogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosClient.get('/blogs')
      .then((res) => setArticles(res.data || []))
      .catch((err) => console.error('Failed to fetch blogs:', err))
      .finally(() => setLoading(false));
  }, []);

  // Build dynamic category list from fetched articles
  const uniqueCategories = [...new Set(articles.map((a) => a.category))].sort();
  const categories = ['All', ...uniqueCategories];

  const filteredArticles = articles.filter((art) => {
    const matchesCat = selectedCategory === 'All' || art.category === selectedCategory;
    const matchesSearch = (art.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (art.desc || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (art.author || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-softBg flex flex-col justify-between font-inter text-darkNavy">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-darkNavy via-slate-900 to-indigo-950 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-sky-300 border border-primary/30 px-3.5 py-1 rounded-full text-xs font-semibold">
            <span>📚</span> Medical Insights & Clinical Health Articles
          </div>
          
          <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight">
            Latest Medical Insights & Health Blog
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Verified healthcare articles, preventive tips, and diagnostic guidance written by senior medical faculty at Brainware Hospital.
          </p>

          {/* Search Bar */}
          <div className="pt-4 space-y-3 max-w-4xl">
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search health topics, doctor advice, or disease management..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-slate-400 text-xs sm:text-sm pl-10 pr-4 py-3 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-slate-900/90 transition"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-2xl transition border shadow-xs ${
                    selectedCategory === cat
                      ? 'bg-primary text-white border-primary shadow-glow scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Articles Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="font-poppins font-bold text-xl text-darkNavy flex items-center gap-2">
            <span>📖</span> Clinical Articles ({filteredArticles.length})
          </h2>
          <span className="text-xs text-slateText font-medium">
            Updated regularly by Brainware Medical Faculty
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 font-bold flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            Loading health articles...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200 shadow-xs max-w-lg mx-auto">
            <span className="text-4xl">🔍</span>
            <h3 className="font-poppins font-bold text-darkNavy text-lg">No Articles Found</h3>
            <p className="text-xs text-slateText">
              No medical insights matched search query "{searchTerm}". Try switching categories or clearing search.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primaryDark transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((art) => (
              <div
                key={art._id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-card hover:shadow-cardHover transition duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-darkNavy/90 backdrop-blur-md text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs font-extrabold text-darkNavy">
                      <span className="font-extrabold text-darkNavy">📅 {art.createdAt ? new Date(art.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
                      <span className="font-extrabold text-darkNavy">🕐 {art.createdAt ? new Date(art.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>

                    <h3 className="font-poppins font-bold text-darkNavy text-base group-hover:text-primary transition-colors leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slateText line-clamp-3 leading-relaxed">
                      {art.desc}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
                  <div>
                    <p className="font-poppins font-extrabold text-xs text-darkNavy">{art.author}</p>
                    <p className="text-[10px] text-darkNavy font-bold">{art.role}</p>
                  </div>
                  <button
                    onClick={() => setActiveArticle(art)}
                    className="text-xs font-bold text-primary hover:text-primaryDark flex items-center gap-1 bg-primaryLight px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    Read Article →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Article Detail Reading Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 text-slateText hover:text-darkNavy font-bold text-xl cursor-pointer"
            >
              ✕
            </button>

            <span className="text-xs font-bold text-primary bg-primaryLight px-3 py-1 rounded-full">
              {activeArticle.category}
            </span>

            <h3 className="font-poppins font-bold text-xl text-darkNavy leading-snug">{activeArticle.title}</h3>

            <div className="flex items-center gap-2 text-xs font-extrabold text-darkNavy pb-2 border-b border-slate-100 flex-wrap">
              <span className="font-extrabold text-darkNavy">{activeArticle.author} ({activeArticle.role})</span>
              <span className="font-extrabold text-darkNavy">• 📅 {activeArticle.createdAt ? new Date(activeArticle.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : ''} 🕐 {activeArticle.createdAt ? new Date(activeArticle.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>

            <img src={activeArticle.image} alt={activeArticle.title} className="w-full h-48 object-cover rounded-2xl" />

            <p className="text-xs text-slateText leading-relaxed">
              {activeArticle.desc}
            </p>

            <div className="p-4 bg-softBg rounded-2xl text-xs text-darkNavy leading-relaxed border border-slate-200/80">
              <p className="font-extrabold mb-3 text-primary text-xs uppercase tracking-wide">📌 Detailed Clinical Guidance & Medical Insights:</p>
              <FormattedArticleContent content={activeArticle.fullText} />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-6 py-2.5 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primaryDark transition shadow cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
