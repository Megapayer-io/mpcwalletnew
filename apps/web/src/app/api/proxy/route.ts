import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Validate URL
    let url: URL;
    try {
      url = new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Only allow HTTP and HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
      return NextResponse.json({ error: 'Only HTTP and HTTPS URLs are allowed' }, { status: 400 });
    }

    // Fetch the content
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    
    // Only process HTML content
    if (!contentType.includes('text/html')) {
      return NextResponse.json(
        { error: 'Only HTML content is supported' },
        { status: 400 }
      );
    }

    let content = await response.text();

    // Process the content to make it work in our environment
    content = processContent(content, targetUrl);

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function processContent(content: string, baseUrl: string): string {
  try {
    const baseUrlObj = new URL(baseUrl);
    const baseUrlOrigin = baseUrlObj.origin;
    
    // Convert relative URLs to absolute URLs
    let processedContent = content
      // Handle src attributes
      .replace(/src="\/([^"]*)"/g, `src="${baseUrlOrigin}/$1"`)
      .replace(/src='\/([^']*)'/g, `src='${baseUrlOrigin}/$1'`)
      // Handle href attributes
      .replace(/href="\/([^"]*)"/g, `href="${baseUrlOrigin}/$1"`)
      .replace(/href='\/([^']*)'/g, `href='${baseUrlOrigin}/$1'`)
      // Handle CSS url() functions
      .replace(/url\(\/([^)]*)\)/g, `url(${baseUrlOrigin}/$1)`)
      .replace(/url\('\/\/([^)]*)\)/g, `url('${baseUrlOrigin}/$1)`)
      .replace(/url\("\/\/([^)]*)\)/g, `url("${baseUrlOrigin}/$1)`);

    // Remove problematic headers and scripts that might cause issues
    processedContent = processedContent
      // Remove X-Frame-Options
      .replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '')
      // Remove Content-Security-Policy that blocks iframes
      .replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')
      // Remove CSP headers in style tags
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, (match) => {
        return match.replace(/@import[^;]*;/g, '');
      });

    return processedContent;
  } catch (error) {
    console.error('Content processing error:', error);
    return content; // Return original content if processing fails
  }
}
