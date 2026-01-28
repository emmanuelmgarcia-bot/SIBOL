const supabase = require('../config/supabase');

const WEBSITE_CONTENT_ID = 1;

const getWebsiteContent = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('website_content')
      .select('id, hero_json, news_json, events_json')
      .eq('id', WEBSITE_CONTENT_ID)
      .maybeSingle();

    if (error) {
      console.error('Supabase get website_content error:', error.message);
      return res.status(500).json({ error: 'Failed to load website content: ' + error.message });
    }

    if (!data) {
      return res.status(200).json({
        heroSlides: [],
        newsItems: [],
        eventItems: []
      });
    }

    return res.status(200).json({
      heroSlides: data.hero_json || [],
      newsItems: data.news_json || [],
      eventItems: data.events_json || []
    });
  } catch (err) {
    console.error('Get website content exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const saveWebsiteContent = async (req, res) => {
  try {
    const { heroSlides, newsItems, eventItems } = req.body || {};

    const payload = {
      id: WEBSITE_CONTENT_ID,
      hero_json: Array.isArray(heroSlides) ? heroSlides : [],
      news_json: Array.isArray(newsItems) ? newsItems : [],
      events_json: Array.isArray(eventItems) ? eventItems : []
    };

    const { error } = await supabase
      .from('website_content')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert website_content error:', error.message);
      return res.status(500).json({ error: 'Failed to save website content: ' + error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Save website content exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const getWebsiteStats = async (req, res) => {
  try {
    // 1. Count HEIs
    const { count: heiCount, error: heiError } = await supabase
      .from('heis')
      .select('*', { count: 'exact', head: true });
    
    if (heiError) {
      console.error('Stats: HEI count error:', heiError.message);
    }

    // 2. Count Faculty
    const { count: facultyCount, error: facultyError } = await supabase
      .from('faculty')
      .select('*', { count: 'exact', head: true });

    if (facultyError) {
      console.error('Stats: Faculty count error:', facultyError.message);
    }

    // 3. Count Subjects (IP Subjects)
    const { count: subjectCount, error: subjectError } = await supabase
      .from('subjects')
      .select('*', { count: 'exact', head: true });

    if (subjectError) {
      console.error('Stats: Subject count error:', subjectError.message);
    }

    return res.status(200).json({
      heiCount: heiCount || 0,
      ipFacultyCount: facultyCount || 0,
      ipSubjectCount: subjectCount || 0
    });

  } catch (err) {
    console.error('Get website stats exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

module.exports = {
  getWebsiteContent,
  saveWebsiteContent,
  getWebsiteStats
};

