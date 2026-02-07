import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

interface VideoEntry {
  category: string;
  title: string;
  url: string;
}

const CSV_PATH = path.join(process.cwd(), 'data', 'videoUrls.csv');

// Parse CSV file
function parseCSV(csvContent: string): VideoEntry[] {
  const lines = csvContent.trim().split('\n');
  
  return lines.slice(1).map(line => {
    const values = line.trim().split(',');
    return {
      category: values[0],
      title: values[1],
      url: values[2],
    };
  });
}

// Convert videos array back to CSV
function toCSV(videos: VideoEntry[]): string {
  const header = 'category,title,url';
  const rows = videos.map(v => `${v.category},${v.title},${v.url}`);
  return [header, ...rows].join('\n');
}

// Check authentication
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_auth')?.value === 'true';
}

// GET - Fetch all videos
export async function GET() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const videos = parseCSV(csvContent);
    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read videos' }, { status: 500 });
  }
}

// POST - Add new video
export async function POST(request: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { category, title, url } = await request.json();
    
    if (!category || !title || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const videos = parseCSV(csvContent);
    
    videos.push({ category, title, url });
    
    fs.writeFileSync(CSV_PATH, toCSV(videos));
    
    return NextResponse.json({ success: true, videos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add video' }, { status: 500 });
  }
}

// PUT - Update videos (for reordering or editing)
export async function PUT(request: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { videos } = await request.json();
    
    if (!Array.isArray(videos)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    fs.writeFileSync(CSV_PATH, toCSV(videos));
    
    return NextResponse.json({ success: true, videos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update videos' }, { status: 500 });
  }
}

// DELETE - Remove a video by index
export async function DELETE(request: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { index } = await request.json();
    
    if (typeof index !== 'number') {
      return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
    }

    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const videos = parseCSV(csvContent);
    
    if (index < 0 || index >= videos.length) {
      return NextResponse.json({ error: 'Index out of bounds' }, { status: 400 });
    }

    videos.splice(index, 1);
    
    fs.writeFileSync(CSV_PATH, toCSV(videos));
    
    return NextResponse.json({ success: true, videos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
