'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable, Button, Card } from '@/components/ui';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: '⏳ En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: '✅ Confirmé', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: '❌ Refusé', color: 'bg-red-100 text-red-800' },
  { value: 'expired', label: '⌛ Expiré', color: 'bg-gray-100 text-gray-800' },
  { value: 'completed', label: '🎭 Réalisé', color: 'bg-blue-100 text-blue-800' },
  { value: 'cancelled', label: '🚫 Annulé', color: 'bg-red-100 text-red-800' },
];

export default function ShowsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  const url = statusFilter 
    ? `/api/shows?status=${statusFilter}`
    : '/api/shows';
  
  const { data: shows = [], isLoading, mutate } = useSWR(url, fetcher);

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    const color = option?.color || 'bg-gray-100 text-gray-800';
    const label = option?.label?.split(' ')[1] || status;
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
        {label}
      </span>
    );
  };

  const columns = [
    {
      key: 'title',
      label: 'Titre',
      render: (show: any) => (
        <div>
          <div className="font-medium">{show.title}</div>
          {show.description && (
            <div className="text-xs text-gray-500 truncate max-w-xs">
              {show.description.slice(0, 60)}...
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      render: (show: any) => (
        <div>
          <div>{show.client.name}</div>
          <div className="text-xs text-gray-500 capitalize">{show.client.type}</div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (show: any) => {
        const date = show.confirmedDate || show.proposedDate;
        if (!date) return '-';
        
        const d = new Date(date);
        const isPast = d < new Date();
        
        return (
          <div>
            <div className={isPast ? 'text-gray-400' : ''}>
              {d.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
            </div>
            {show.duration && (
              <div className="text-xs text-gray-500">{show.duration} min</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'price',
      label: 'Prix',
      render: (show: any) => {
        const price = show.agreedPrice || show.proposedPrice;
        return (
          <div className="font-semibold">
            €{Number(price).toFixed(2)}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      render: (show: any) => getStatusBadge(show.status),
    },
    {
      key: 'actions',
      label: '',
      render: (show: any) => (
        <div className="flex gap-1">
          {show.status === 'pending' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(show.id, 'confirmed');
                }}
                className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                title="Confirmer"
              >
                ✓
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(show.id, 'rejected');
                }}
                className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                title="Refuser"
              >
                ✗
              </button>
            </>
          )}
          {show.status === 'confirmed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(show.id, 'completed');
              }}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              title="Marquer comme réalisé"
            >
              🎭
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleStatusChange = async (showId: number, newStatus: string) => {
    if (!confirm(`Confirmer le changement de statut ?`)) return;

    try {
      const response = await fetch(`/api/shows/${showId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          ...(newStatus === 'confirmed' && { responseDate: new Date() }),
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      mutate();
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    router.push(`/shows?${params.toString()}`);
  };

  // Statistiques rapides
  const stats = {
    total: shows.length,
    totalValue: shows.reduce((sum: number, s: any) => 
      sum + Number(s.agreedPrice || s.proposedPrice), 0
    ),
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Spectacles & Animations</h1>
        <Button onClick={() => router.push('/shows/new')}>
          ➕ Nouvelle proposition
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Total spectacles</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="text-4xl">🎭</div>
          </div>
        </Card>
        <Card>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Valeur totale</div>
              <div className="text-2xl font-bold">€{stats.totalValue.toFixed(2)}</div>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterChange(option.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                statusFilter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <DataTable
        data={shows}
        columns={columns}
        onRowClick={(show: any) => router.push(`/shows/${show.id}`)}
        isLoading={isLoading}
        emptyMessage="Aucun spectacle trouvé"
      />
    </div>
  );
}