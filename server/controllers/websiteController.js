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

const getStats = async (req, res) => {
  try {
    // 1. Partner HEIs (Approved Registrations)
    const { count: heiCount, error: heiError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Approved');

    if (heiError) throw heiError;

    // 2. IP Subjects (Approved & Specific Types)
    const { count: ipSubjectCount, error: subjectError } = await supabase
      .from('subjects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Approved')
      .in('type', ['Integrated', 'Elective', 'Degree Program']);

    if (subjectError) throw subjectError;

    // 3. Total Faculties (All entries in faculty table)
    const { count: facultyCount, error: facultyError } = await supabase
      .from('faculty')
      .select('*', { count: 'exact', head: true });

    if (facultyError) throw facultyError;

    return res.status(200).json({
      heiCount: heiCount || 0,
      ipSubjectCount: ipSubjectCount || 0,
      facultyCount: facultyCount || 0
    });

  } catch (err) {
    console.error('Get stats exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

module.exports = {
  getWebsiteContent,
  saveWebsiteContent,
  getStats
};

