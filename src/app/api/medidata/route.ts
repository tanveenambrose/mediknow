import { NextRequest, NextResponse } from 'next/server';
import { fetchMediData, clearMediDataCache, getMediDataStatus } from '@/lib/medidata';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '30', 10);
  const skip = parseInt(searchParams.get('skip') || '0', 10);
  const category = searchParams.get('category') || 'All';
  const form = searchParams.get('form') || 'All';
  const prescription = searchParams.get('prescription') || 'All';

  const status = getMediDataStatus();
  if (!status.keyValid) {
    return NextResponse.json({
      results: [],
      total: 0,
      fallback: true,
      source: 'medidata',
      status,
      error: `MediData not available: ${status.message}`,
    });
  }

  const result = await fetchMediData({ q, category, form, prescription, limit, skip });

  return NextResponse.json({
    results: result.results,
    total: result.total,
    fallback: result.fallback,
    source: 'medidata',
    status,
  });
}

export async function POST() {
  clearMediDataCache();
  return NextResponse.json({ success: true, message: 'MediData cache cleared' });
}
