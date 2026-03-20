// src/lib/books.ts
export async function searchGoogleBooks(query: string) {
  if (!query.trim()) return [];
  
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`
    );
    const data = await res.json();

    return data.items?.map((item: any) => ({
      google_id: item.id,
      title: item.volumeInfo.title || 'Untitled',
      author: item.volumeInfo.authors?.[0] || "Unknown Author",
      cover_url: item.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") || item.volumeInfo.imageLinks?.smallThumbnail?.replace("http:", "https:") || '',
      description: item.volumeInfo.description,
      total_pages: item.volumeInfo.pageCount || 0,
    })) || [];
  } catch (error) {
    console.error('Error searching Google Books:', error);
    return [];
  }
}