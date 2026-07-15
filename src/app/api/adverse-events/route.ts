import { NextRequest, NextResponse } from 'next/server';

interface AdverseEvent {
  id: string;
  medicineName: string;
  serious: boolean;
  reactions: string[];
  sex: string;
  age?: number;
  country: string;
  reportId: string;
  reportDate: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);

  if (!q) {
    return NextResponse.json({ results: [], total: 0, error: 'Query parameter "q" is required' });
  }

  try {
    const searchQuery = `patient.drug.openfda.brand_name:"${q.replace(/["\\]/g, '\\$&')}" OR patient.drug.openfda.generic_name:"${q.replace(/["\\]/g, '\\$&')}" OR patient.reaction.reactionmeddrapt.exact:"${q.replace(/["\\]/g, '\\$&')}"`;

    const url = `https://api.fda.gov/drug/event.json?search=${encodeURIComponent(searchQuery)}&limit=${limit}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 404) {
      return NextResponse.json({ results: [], total: 0 });
    }

    if (!response.ok) {
      throw new Error(`openFDA event API error: ${response.status}`);
    }

    const data = await response.json();
    const total = data.meta?.results?.total || 0;

    const events: AdverseEvent[] = (data.results || []).map((item: any, index: number) => {
      const drugs = item.patient?.drug || [];
      const brandName = drugs[0]?.openfda?.brand_name?.[0] || drugs[0]?.medicinalproduct || q;
      const reactions = (item.patient?.reaction || []).map((r: any) => r.reactionmeddrapt?.exact || r.reactionmeddrapt || 'Unknown').filter(Boolean);

      return {
        id: `ae-${item.safetyreportid}-${index}`,
        medicineName: brandName,
        serious: item.serious === '1',
        reactions: reactions.slice(0, 5),
        sex: item.patient?.patientsex === '1' ? 'Male' : item.patient?.patientsex === '2' ? 'Female' : 'Unknown',
        age: item.patient?.patientonsetage ? parseInt(item.patient.patientonsetage) : undefined,
        country: item.primarysource?.reportercountry || 'Unknown',
        reportId: item.safetyreportid,
        reportDate: item.receivedate || '',
      };
    });

    return NextResponse.json({
      results: events,
      total,
      source: 'openfda-events',
    });
  } catch (error) {
    console.error('[AdverseEvents] Error:', error);
    return NextResponse.json({ results: [], total: 0, error: 'Failed to fetch adverse events' });
  }
}
