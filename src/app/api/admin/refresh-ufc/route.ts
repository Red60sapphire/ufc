import { NextResponse } from 'next/server';

export async function POST() {
  try {
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      const cacheDir = path.join(os.tmpdir(), 'ufc-cache');
      
      if (fs.existsSync(cacheDir)) {
        const files = fs.readdirSync(cacheDir);
        for (const file of files) {
          fs.unlinkSync(path.join(cacheDir, file));
        }
      }
    }
    return NextResponse.json({ success: true, message: 'UFC data cache cleared' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}