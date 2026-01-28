import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Trash2, Plus, Upload, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminPage = () => {
  const {
    heroSlides, addHeroSlide, removeHeroSlide,
    newsItems, addNewsItem, updateNewsItem, removeNewsItem,
    eventItems, addEventItem, updateEventItem, removeEventItem,
    saveWebsiteContent, saving, saveError
  } = useData();

  const [activeTab, setActiveTab] = useState('hero');
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    try {
      await saveWebsiteContent();
      setSaveMessage('Changes saved');
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch {
    }
  };

  // Helper for file upload simulation
  const handleFileUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 pt-20">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-green-900">Admin Dashboard</h1>
                <div className="flex items-center gap-3">
                    {saveMessage && (
                        <span className="text-sm text-green-700">
                            {saveMessage}
                        </span>
                    )}
                    {saveError && (
                        <span className="text-sm text-red-600 max-w-xs">
                            {saveError}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-4 mb-8 border-b border-gray-300">
                <button 
                    className={`pb-2 px-4 font-medium ${activeTab === 'hero' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('hero')}
                >
                    Hero Images
                </button>
                <button 
                    className={`pb-2 px-4 font-medium ${activeTab === 'news' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('news')}
                >
                    News
                </button>
                <button 
                    className={`pb-2 px-4 font-medium ${activeTab === 'events' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('events')}
                >
                    Events
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded shadow p-6">
                
                {/* Hero Images Tab */}
                {activeTab === 'hero' && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Manage Hero Images</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {heroSlides.map(slide => (
                                <div key={slide.id} className="relative group">
                                    <img src={slide.url} alt="Hero Slide" className="w-full h-40 object-cover rounded" />
                                    <button 
                                        onClick={() => removeHeroSlide(slide.id)}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                                <Upload size={18} className="mr-2" />
                                Upload New Image
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, addHeroSlide)} />
                            </label>
                        </div>
                    </div>
                )}

                {/* News Tab */}
                {activeTab === 'news' && (
                   <ManageItems 
                        items={newsItems} 
                        addItem={addNewsItem} 
                        removeItem={removeNewsItem} 
                        updateItem={updateNewsItem}
                        title="News"
                   />
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                   <ManageItems 
                        items={eventItems} 
                        addItem={addEventItem} 
                        removeItem={removeEventItem} 
                        updateItem={updateEventItem}
                        title="Events"
                   />
                )}

            </div>
        </div>
        <Footer />
    </div>
  );
};

// Sub-component for managing News/Events to avoid code duplication
const ManageItems = ({ items, addItem, removeItem, updateItem, title }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState({ title: '', category: '', image: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        addItem(currentItem);
        setIsEditing(false);
        setCurrentItem({ title: '', category: '', image: '' });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentItem({ ...currentItem, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Manage {title}</h2>
                <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    <Plus size={18} className="mr-2" /> Add {title}
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between border p-4 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                            <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                            <div>
                                <h3 className="font-bold">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.category}</p>
                            </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Add {title}</h3>
                            <button onClick={() => setIsEditing(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full border rounded px-3 py-2"
                                    value={currentItem.title}
                                    onChange={e => setCurrentItem({...currentItem, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category/Date</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded px-3 py-2"
                                    value={currentItem.category}
                                    onChange={e => setCurrentItem({...currentItem, category: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="w-full"
                                />
                                {currentItem.image && <img src={currentItem.image} alt="Preview" className="mt-2 h-20 rounded" />}
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
