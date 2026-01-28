import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [heroSlides, setHeroSlides] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [eventItems, setEventItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const buildApiUrl = (path) => {
    const baseEnv = import.meta.env.VITE_API_BASE_URL;
    const base = baseEnv && typeof baseEnv === 'string' ? baseEnv.trim() : '';
    if (!base) {
      return path;
    }
    const normalizedBase = base.replace(/\/$/, '');
    return `${normalizedBase}${path}`;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(buildApiUrl('/api/website/content'));
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        const data = await res.json();
        if (data && typeof data === 'object') {
          setHeroSlides(Array.isArray(data.heroSlides) ? data.heroSlides : []);
          setNewsItems(Array.isArray(data.newsItems) ? data.newsItems : []);
          setEventItems(Array.isArray(data.eventItems) ? data.eventItems : []);
        }
      } catch (err) {
        console.error('Failed to load website content', err);
        setLoadError(err.message || 'Failed to load website content');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveWebsiteContent = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(buildApiUrl('/api/website/content'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroSlides, newsItems, eventItems }),
      });
      if (!res.ok) {
        let message = `Status ${res.status}`;
        try {
          const body = await res.json();
          if (body && body.error) {
            message = body.error;
          }
        } catch {
        }
        throw new Error(message);
      }
    } catch (err) {
      console.error('Failed to save website content', err);
      setSaveError(err.message || 'Failed to save website content');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const addHeroSlide = (url) => {
    setHeroSlides((prev) => [...prev, { id: Date.now(), url }]);
  };

  const removeHeroSlide = (id) => {
    setHeroSlides((prev) => prev.filter((slide) => slide.id !== id));
  };

  const addNewsItem = (item) => {
    setNewsItems((prev) => [...prev, { ...item, id: Date.now() }]);
  };

  const updateNewsItem = (id, updatedItem) => {
    setNewsItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item))
    );
  };

  const removeNewsItem = (id) => {
    setNewsItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addEventItem = (item) => {
    setEventItems((prev) => [...prev, { ...item, id: Date.now() }]);
  };

  const updateEventItem = (id, updatedItem) => {
    setEventItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item))
    );
  };

  const removeEventItem = (id) => {
    setEventItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        heroSlides,
        newsItems,
        eventItems,
        addHeroSlide,
        removeHeroSlide,
        addNewsItem,
        updateNewsItem,
        removeNewsItem,
        addEventItem,
        updateEventItem,
        removeEventItem,
        saveWebsiteContent,
        loading,
        loadError,
        saving,
        saveError,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
