'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, StatusBadge, Modal } from '@/components/ui';
import { ShowForm } from '@/components/shows/ShowForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ShowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const showId = parseInt(resolvedParams.id);

  const { data: show, isLoading, mutate } = useSWR(`/api/shows/${showId}`, fetcher);
  const { data: payments = [] } = useSWR(
    show ? `/api/payments?showClientId=${show.clientId}` : null,
    fetcher
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentType: 'check',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Spectacle non trouvé</p>
        </Card>
      </div>
    );
  }

  const handleUpdate = async (data: any) => {
    try {
      const response = await fetch(`/api/shows/${showId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update');

      setIsEditing(false);
      mutate();
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce spectacle ?')) return;

    try {
      const response = await fetch(`/api/shows/${showId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      router.push('/shows');
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleCreatePayment = async () => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showClientId: show.clientId,
          amount: parseFloat(paymentData.amount),
          paymentType: paymentData.paymentType,
          paymentDate: new Date(paymentData.paymentDate),
          reference: paymentData.reference || undefined,
          notes: paymentData.notes || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to create payment');

      setIsPaymentModalOpen(false);
      setPaymentData({
        amount: '',
        paymentType: 'check',
        paymentDate: new Date().toISOString().split('T')[0],
        reference: '',
        notes: '',
      });
      mutate();
    } catch (error) {
      alert('Erreur lors de la création du paiement');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const date = show.confirmedDate || show.proposedDate;
  const price = show.agreedPrice || show.proposedPrice;
  const totalPaid = payments.reduce((sum: number, p: any) => 
    p.status === 'cashed' ? sum + Number(p.amount) : sum, 0
  );
  const balance = Number(price) - totalPaid;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link
        href="/shows"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux spectacles
      </Link>

      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{show.title}</h1>
          <div className="flex items-center gap-3">
            <StatusBadge
              status={show.status}
              colorMap={{
                pending: getStatusColor('pending'),
                confirmed: getStatusColor('confirmed'),
                rejected: getStatusColor('rejected'),
                expired: getStatusColor('expired'),
                completed: getStatusColor('completed'),
                cancelled: getStatusColor('cancelled'),
              }}
            />
            {date && (
              <span className="text-gray-600">
                {new Date(date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button onClick={() => setIsEditing(true)}>Modifier</Button>
              <Button variant="danger" onClick={handleDelete}>
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <ShowForm
          initialData={show}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="space-y-6">
          {/* Informations client */}
          <Card title="Client">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-600">Nom</div>
                  <div className="font-medium text-lg">{show.client.name}</div>
                </div>
                {show.client.contactName && (
                  <div>
                    <div className="text-sm text-gray-600">Contact</div>
                    <div>{show.client.contactName}</div>
                  </div>
                )}
                <div className="flex gap-4">
                  {show.client.email && (
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div>{show.client.email}</div>
                    </div>
                  )}
                  {show.client.phone && (
                    <div>
                      <div className="text-sm text-gray-600">Téléphone</div>
                      <div>{show.client.phone}</div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="capitalize">{show.client.type}</div>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => router.push(`/shows/clients/${show.clientId}`)}
              >
                Voir la fiche client
              </Button>
            </div>
          </Card>

          {/* Détails du spectacle */}
          <Card title="Détails de la prestation">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {show.description && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                    {show.description}
                  </dd>
                </div>
              )}
              {show.proposedDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date proposée</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(show.proposedDate).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
              )}
              {show.confirmedDate && show.confirmedDate !== show.proposedDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date confirmée</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(show.confirmedDate).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
              )}
              {show.duration && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Durée</dt>
                  <dd className="mt-1 text-sm text-gray-900">{show.duration} minutes</dd>
                </div>
              )}
              {show.location && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Lieu</dt>
                  <dd className="mt-1 text-sm text-gray-900">{show.location}</dd>
                </div>
              )}
              {show.notes && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                    {show.notes}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Tarification et paiements */}
          <Card
            title="Tarification et paiements"
            actions={
              <Button size="sm" onClick={() => setIsPaymentModalOpen(true)}>
                + Enregistrer un paiement
              </Button>
            }
          >
            <div className="space-y-4">
              {/* Résumé financier */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Prix convenu</div>
                  <div className="text-xl font-bold">€{Number(price).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Payé (encaissé)</div>
                  <div className="text-xl font-bold text-green-600">
                    €{totalPaid.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Solde</div>
                  <div className={`text-xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    €{balance.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Liste des paiements */}
              {payments.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-2">Paiements enregistrés</h4>
                  <div className="space-y-2">
                    {payments.map((payment: any) => (
                      <div
                        key={payment.id}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {payment.reference || 'Sans référence'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(payment.paymentDate).toLocaleDateString('fr-FR')} •{' '}
                            <span className="capitalize">{payment.paymentType}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">€{Number(payment.amount).toFixed(2)}</div>
                          <StatusBadge status={payment.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun paiement enregistré</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Modal paiement */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Enregistrer un paiement"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="font-semibold">{show.title}</div>
            <div className="text-sm text-gray-600">{show.client.name}</div>
            <div className="text-sm mt-2">
              Prix: €{Number(price).toFixed(2)} • Restant: €{balance.toFixed(2)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant (€) *
            </label>
            <input
              type="number"
              step="0.01"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de paiement *
            </label>
            <select
              value={paymentData.paymentType}
              onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="cash">Espèces</option>
              <option value="check">Chèque</option>
              <option value="transfer">Virement</option>
              <option value="card">Carte bancaire</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date du paiement *
            </label>
            <input
              type="date"
              value={paymentData.paymentDate}
              onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Référence
            </label>
            <input
              type="text"
              value={paymentData.reference}
              onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="N° de chèque, transaction..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setIsPaymentModalOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreatePayment}
              disabled={!paymentData.amount}
              className="flex-1"
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}