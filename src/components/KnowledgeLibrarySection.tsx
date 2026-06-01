"use client";
import React, { useEffect, useState } from "react";
import { BackgroundPaths } from "./ui/background-paths";

interface Article {
  id: number;
  title: string;
  category: string;
  content: string;
}

export function KnowledgeLibrarySection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  useEffect(() => {
    async function loadArticles() {
      try {
        const res = await fetch('/api/knowledge/articles');
        const data = await res.json();
        if (data.success) {
          setArticles(data.data);
        }
      } catch (error) {
        console.error('加载知识库失败:', error);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  const categories = ['全部', ...new Set(articles.map(a => a.category))];
  const filteredArticles = activeCategory === '全部'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  return (
    <section id="library" className="py-20 sm:py-28">
      <div className="container-x">
        <div className="overflow-hidden rounded-[2rem] lg:rounded-[3rem] shadow-2xl shadow-black/30">
          <BackgroundPaths title="风电大件运输知识库" />

          <div className="relative z-10 border-t border-white/10 bg-navy-950/80 backdrop-blur-xl p-6">
            {/* 分类标签 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    activeCategory === cat
                      ? 'bg-orange-safety text-navy-950'
                      : 'bg-white/10 text-steel-300 hover:bg-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 文章列表 */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3 text-steel-400">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>正在加载知识库...</span>
                </div>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12 text-steel-400">暂无文章</div>
            ) : (
              <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                {filteredArticles.map((article, index) => (
                  <a
                    href={`/library/article/${article.id}`}
                    key={article.id}
                    className="group min-h-36 bg-navy-950/72 p-6 transition hover:bg-orange-safety/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-safety"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-orange-safety">
                        {article.category}
                      </span>
                      <span className="font-mono text-xs text-orange-safety">
                        GUIDE / {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white transition group-hover:text-orange-safetyLight">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm leading-5 text-steel-400 line-clamp-2">
                      {article.content.substring(0, 100)}...
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
