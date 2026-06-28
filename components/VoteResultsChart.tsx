'use client';

import { useEffect, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type CandidateResult = {
  id: string;
  name: string;
  position: string;
  votes: number;
};

export default function VoteResultsChart({
  sessionId,
  initialResults,
}: {
  sessionId: string;
  initialResults: CandidateResult[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  const [results, setResults] = useState(initialResults);
  const [live, setLive] = useState(false);

  // Subscribe to new votes for this session and increment counts in place
  useEffect(() => {
    const supabase = supabaseBrowser();
    const channel = supabase
      .channel(`votes-session-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes', filter: `session_id=eq.${sessionId}` },
        (payload: any) => {
          const candidateId = payload.new.candidate_id;
          setResults((prev) =>
            prev.map((c) => (c.id === candidateId ? { ...c, votes: c.votes + 1 } : c))
          );
        }
      )
      .subscribe((status: string) => setLive(status === 'SUBSCRIBED'));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Render / update the chart whenever results change
  useEffect(() => {
    let isMounted = true;

    import('chart.js/auto').then((ChartModule) => {
      if (!isMounted || !canvasRef.current) return;
      const Chart = ChartModule.default;

      const labels = results.map((r) => r.name);
      const data = results.map((r) => r.votes);

      if (chartRef.current) {
        chartRef.current.data.labels = labels;
        chartRef.current.data.datasets[0].data = data;
        chartRef.current.update();
        return;
      }

      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Votes',
              data,
              backgroundColor: '#3D67CC',
              borderRadius: 6,
              maxBarThickness: 48,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
          },
        },
      });
    });

    return () => {
      isMounted = false;
    };
  }, [results]);

  useEffect(() => {
    return () => {
      chartRef.current?.destroy?.();
    };
  }, []);

  const total = results.reduce((sum, r) => sum + r.votes, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted">{total} vote{total === 1 ? '' : 's'} so far</p>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            live ? 'text-ok' : 'text-muted'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-ok' : 'bg-muted'}`} />
          {live ? 'Live' : 'Connecting…'}
        </span>
      </div>
      <div style={{ position: 'relative', height: Math.max(240, results.length * 50) }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Bar chart of votes per candidate: ${results
            .map((r) => `${r.name} ${r.votes}`)
            .join(', ')}`}
        />
      </div>
    </div>
  );
}
