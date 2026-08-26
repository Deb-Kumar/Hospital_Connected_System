import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import FormattedArticleContent from '../FormattedArticleContent';

export default function HealthBlog() {
  const [activeArticle, setActiveArticle] = useState(null);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    axiosClient.get('/blogs/home')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setArticles(res.data);
        }
      })
      .catch((err) => console.error('Failed to fetch home blogs:', err));
  }, []);

  return (
    <section id="blog" className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Right-Aligned Show More Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primaryLight px-3 py-1 rounded-full">
              Health Awareness & Tips
            </span>
            <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-darkNavy mt-3">
              Latest Medical Insights & Articles
            </h2>
            <p className="text-slateText text-sm mt-2 max-w-xl">
              Stay informed with verified medical articles written by senior doctors and clinical specialists at Brainware Hospital.
            </p>
          </div>

          <div className="flex justify-start md:justify-end">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primaryDark text-white font-poppins font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs hover:shadow-cardHover transition transform hover:scale-105 whitespace-nowrap"
            >
              <span>Show More Articles</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((art) => (
            <div
              key={art.id}
              className="bg-softBg rounded-3xl overflow-hidden border border-slate-200/80 shadow-card hover:shadow-cardHover transition duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-200">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-darkNavy/80 backdrop-blur-md text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">
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

              <div className="p-6 pt-0 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <p className="font-poppins font-extrabold text-xs text-darkNavy">{art.author}</p>
                  <p className="text-[10px] text-darkNavy font-bold">{art.role}</p>
                </div>
                <button
                  onClick={() => setActiveArticle(art)}
                  className="text-xs font-bold text-primary hover:text-primaryDark flex items-center gap-1"
                >
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Article Reading Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 text-slateText hover:text-darkNavy font-bold text-xl"
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
              <p className="font-extrabold mb-3 text-primary text-xs uppercase tracking-wide">📌 Clinical Advice & Medical Insights:</p>
              <FormattedArticleContent content={activeArticle.fullText} />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-6 py-2 text-xs font-semibold bg-primary text-white rounded-xl"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
