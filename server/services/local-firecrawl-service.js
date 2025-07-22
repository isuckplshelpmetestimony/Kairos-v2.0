const axios = require('axios');

class LocalFirecrawlService {
  constructor() {
    this.baseURL = 'http://localhost:3002'; // Default Firecrawl port
    this.isReady = false;
    this.initializeService();
  }

  async initializeService() {
    try {
      // Check if local Firecrawl is running
      await axios.get(`${this.baseURL}/health`);
      this.isReady = true;
      console.log('✅ Local Firecrawl service connected');
    } catch (error) {
      console.warn('⚠️ Local Firecrawl not available, using fallback methods');
      this.isReady = false;
    }
  }

  async scrapeURL(url, options = {}) {
    if (!this.isReady) {
      return this.fallbackScrape(url);
    }

    try {
      const response = await axios.post(`${this.baseURL}/v0/scrape`, {
        url,
        pageOptions: {
          onlyMainContent: true,
          includeHtml: false,
          ...options
        }
      });

      return {
        success: true,
        data: response.data,
        source: url
      };
    } catch (error) {
      console.error(`Firecrawl scrape failed for ${url}:`, error.message);
      return this.fallbackScrape(url);
    }
  }

  async scrapeMultipleUrls(urls, options = {}) {
    const results = [];

    for (const url of urls) {
      try {
        const result = await this.scrapeURL(url, options);
        if (result.success) {
          results.push(result);
        }

        // Rate limiting - be nice to websites
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
      }
    }

    return results;
  }

  async searchPhilippineBusinessNews(query, limit = 3) {
    const searchUrls = [
      'https://www.bworldonline.com',
      'https://www.philstar.com/business',
      'https://www.rappler.com/business',
      'https://businessmirror.com.ph',
      'https://www.manilatimes.net/category/business'
    ].slice(0, limit);

    return await this.scrapeMultipleUrls(searchUrls, {
      waitFor: 2000,
      extractorOptions: {
        extractMainContent: true,
        mode: 'llm-extraction'
      }
    });
  }

  // Fallback method using simple HTTP requests (when Firecrawl is down)
  async fallbackScrape(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; KairosBot/1.0)'
        }
      });

      // Very basic text extraction
      const textContent = response.data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        success: true,
        data: {
          content: textContent.substring(0, 5000), // Limit content
          url: url,
          title: this.extractTitle(response.data)
        },
        source: url
      };
    } catch (error) {
      console.error(`Fallback scrape failed for ${url}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  extractTitle(html) {
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : 'Unknown Title';
  }
}

module.exports = LocalFirecrawlService; 