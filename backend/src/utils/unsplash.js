export async function getImageForQuery(query) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn('UNSPLASH_ACCESS_KEY is not set. Returning null for image query.');
    return null;
  }
  
  try {
    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.append('query', query);
    url.searchParams.append('per_page', '5');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
      },
    });

    if (!response.ok) {
      if (response.status === 429 || response.status === 403) {
        throw new Error(`RATE_LIMIT:${response.status}`);
      }
      console.error(`Unsplash API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results.map(result => ({
        url: result.urls.small,
        author: result.user.name,
        authorUrl: result.user.links.html
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return null;
  }
}
