import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [heroSlides, setHeroSlides] = useState([
    { id: 1, url: 'https://placehold.co/1920x600/004d00/white?text=Sibol+Hero+Image+1' },
    { id: 2, url: 'https://placehold.co/1920x600/006400/white?text=Sibol+Hero+Image+2' },
    { id: 3, url: 'https://placehold.co/1920x600/003300/white?text=Sibol+Hero+Image+3' },
  ]);

  const [newsItems, setNewsItems] = useState([
    {
      id: 1,
      title: "Caption Caption Caption",
      image: "https://placehold.co/600x400/e0e0e0/333?text=News+Image+1",
      category: ""
    },
    {
      id: 2,
      title: "‘Dreadful wrongs’: WA governor apologises to Noongar people for 1834 Pinjarra massacre",
      image: "https://placehold.co/600x400/e0e0e0/333?text=News+Image+2",
      category: ""
    },
    {
      id: 3,
      title: "Australian governments ‘turning their backs’ on soaring Indigenous incarceration",
      category: "Indigenous affairs reporting",
      image: "https://placehold.co/600x400/e0e0e0/333?text=News+Image+3",
    },
  ]);

  const [eventItems, setEventItems] = useState([
    {
      id: 1,
      title: "Philippines Celebrates Indigenous People’s Day",
      image: "https://placehold.co/600x400/003399/white?text=IP+Day+Poster",
      category: ""
    },
    {
      id: 2,
      title: "Indigenous affairs reporting: Australian governments ‘turning their backs’",
      category: "Indigenous affairs reporting",
      image: "https://placehold.co/600x400/e0e0e0/333?text=Event+Image+2",
    },
    {
      id: 3,
      title: "‘Dreadful wrongs’: WA governor apologises to Noongar people for 1834 Pinjarra massacre",
      image: "https://placehold.co/600x400/e0e0e0/333?text=Event+Image+3",
      category: ""
    },
  ]);

  const addHeroSlide = (url) => {
    setHeroSlides([...heroSlides, { id: Date.now(), url }]);
  };

  const removeHeroSlide = (id) => {
    setHeroSlides(heroSlides.filter(slide => slide.id !== id));
  };

  const addNewsItem = (item) => {
    setNewsItems([...newsItems, { ...item, id: Date.now() }]);
  };

  const updateNewsItem = (id, updatedItem) => {
    setNewsItems(newsItems.map(item => item.id === id ? { ...item, ...updatedItem } : item));
  };

  const removeNewsItem = (id) => {
    setNewsItems(newsItems.filter(item => item.id !== id));
  };

  const addEventItem = (item) => {
    setEventItems([...eventItems, { ...item, id: Date.now() }]);
  };

  const updateEventItem = (id, updatedItem) => {
    setEventItems(eventItems.map(item => item.id === id ? { ...item, ...updatedItem } : item));
  };

  const removeEventItem = (id) => {
    setEventItems(eventItems.filter(item => item.id !== id));
  };

  return (
    <DataContext.Provider value={{
      heroSlides, addHeroSlide, removeHeroSlide,
      newsItems, addNewsItem, updateNewsItem, removeNewsItem,
      eventItems, addEventItem, updateEventItem, removeEventItem
    }}>
      {children}
    </DataContext.Provider>
  );
};
