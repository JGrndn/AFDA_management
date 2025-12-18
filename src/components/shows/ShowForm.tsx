'use client';

import { useState } from 'react';
import { GenericForm, FormField, Button, Modal } from '@/components/ui';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ShowFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const CLIENT_TYPES = [
  { value: 'individual', label: 'Particulier' },
  { value: 'company', label: 'Entreprise' },
  { value: 'municipality', label: 'Mairie' },
  { value: 'school', label: 'École / Association' },
];

export function ShowForm({ initialData, onSubmit, onCancel, isLoading }: ShowFormProps) {
  const { data: clients = [], mutate: mutateClients } = useSWR('/api/shows/clients', fetcher);
  
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    proposedDate: '',
    confirmedDate: '',
    duration: '',
    proposedPrice: '',
    agreedPrice: '',
    location: '',
    notes: '',
    status: 'pending',
    ...initialData,
  });

  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
    type: 'individual',
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [createClientLoading, setCreateClientLoading] = useState(false);
  const [createClientError, setCreateClientError] = useState<string | null>(null);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNewClientField = (field: string, value: any) => {
    setNewClientData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateClient = async () => {
    setCreateClientLoading(true);
    setCreateClientError(null);

    try {
      const response = await fetch('/api/shows/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClientData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create client');
      }

      const newClient = await response.json();
      await mutateClients();
      setFormData((prev) => ({ ...prev, clientId: newClient.id.toString() }));
      setIsCreatingClient(false);
    } catch (err: any) {
      setCreateClientError(err.message);
    } finally {
      setCreateClientLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      clientId: parseInt(formData.clientId),
      duration: formData.duration ? parseInt(formData.duration) : null,
      proposedPrice: parseFloat(formData.proposedPrice),
      agreedPrice: formData.agreedPrice ? parseFloat(formData.agreedPrice) : null,
      proposedDate: formData.proposedDate || null,
      confirmedDate: formData.confirmedDate || null,
    };

    await onSubmit(data);
  };

  return (
    <>
      <GenericForm
        title={initialData ? 'Modifier le spectacle' : 'Nouvelle proposition de spectacle'}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isLoading={isLoading}
      >
        <div className="space-y-6">
          {/* Client */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Client</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <FormField
                  label="Sélectionner un client"
                  name="clientId"
                  type="select"
                  value={formData.clientId}
                  onChange={(v) => updateField('clientId', v)}
                  options={clients.map((c: any) => ({
                    value: c.id,
                    label: `${c.name}${c.contactName ? ` (${c.contactName})` : ''} - ${c.type}`,
                  }))}
                  required
                />
              </div>
              <div className="pt-7">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCreatingClient(true)}
                >
                  + Nouveau client
                </Button>
              </div>
            </div>
          </div>

          {/* Informations spectacle */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Détails du spectacle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField
                  label="Titre / Type d'animation"
                  name="title"
                  value={formData.title}
                  onChange={(v) => updateField('title', v)}
                  placeholder="Ex: Spectacle de magie, Animation anniversaire..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                  label="Description"
                  name="description"
                  type="textarea"
                  value={formData.description}
                  onChange={(v) => updateField('description', v)}
                  placeholder="Détails de la prestation, public visé, particularités..."
                />
              </div>

              <FormField
                label="Date proposée"
                name="proposedDate"
                type="date"
                value={formData.proposedDate}
                onChange={(v) => updateField('proposedDate', v)}
              />

              <FormField
                label="Durée (minutes)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={(v) => updateField('duration', v)}
                placeholder="60"
              />

              <div className="md:col-span-2">
                <FormField
                  label="Lieu"
                  name="location"
                  value={formData.location}
                  onChange={(v) => updateField('location', v)}
                  placeholder="Adresse du lieu de la prestation"
                />
              </div>
            </div>
          </div>

          {/* Prix */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Tarification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Prix proposé (€)"
                name="proposedPrice"
                type="number"
                value={formData.proposedPrice}
                onChange={(v) => updateField('proposedPrice', v)}
                required
              />

              {initialData && (
                <FormField
                  label="Prix négocié (€)"
                  name="agreedPrice"
                  type="number"
                  value={formData.agreedPrice}
                  onChange={(v) => updateField('agreedPrice', v)}
                  helpText="Laisser vide si identique au prix proposé"
                />
              )}
            </div>
          </div>

          {/* Statut et dates de suivi (si modification) */}
          {initialData && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3">Suivi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Statut"
                  name="status"
                  type="select"
                  value={formData.status}
                  onChange={(v) => updateField('status', v)}
                  options={[
                    { value: 'pending', label: '⏳ En attente' },
                    { value: 'confirmed', label: '✅ Confirmé' },
                    { value: 'rejected', label: '❌ Refusé' },
                    { value: 'expired', label: '⌛ Expiré' },
                    { value: 'completed', label: '🎭 Réalisé' },
                    { value: 'cancelled', label: '🚫 Annulé' },
                  ]}
                />

                <FormField
                  label="Date confirmée"
                  name="confirmedDate"
                  type="date"
                  value={formData.confirmedDate}
                  onChange={(v) => updateField('confirmedDate', v)}
                  helpText="Date finale si différente de la date proposée"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <FormField
              label="Notes internes"
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={(v) => updateField('notes', v)}
              placeholder="Remarques, conditions particulières..."
            />
          </div>
        </div>
      </GenericForm>

      {/* Modal création client */}
      <Modal
        isOpen={isCreatingClient}
        onClose={() => setIsCreatingClient(false)}
        title="Créer un nouveau client"
        size="md"
      >
        <div className="space-y-4">
          {createClientError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {createClientError}
            </div>
          )}

          <FormField
            label="Type de client"
            name="type"
            type="select"
            value={newClientData.type}
            onChange={(v) => updateNewClientField('type', v)}
            options={CLIENT_TYPES}
            required
          />

          <FormField
            label="Nom"
            name="name"
            value={newClientData.name}
            onChange={(v) => updateNewClientField('name', v)}
            placeholder="Nom de famille, entreprise, mairie..."
            required
          />

          <FormField
            label="Personne de contact"
            name="contactName"
            value={newClientData.contactName}
            onChange={(v) => updateNewClientField('contactName', v)}
            placeholder="Prénom et nom du contact"
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            value={newClientData.email}
            onChange={(v) => updateNewClientField('email', v)}
          />

          <FormField
            label="Téléphone"
            name="phone"
            value={newClientData.phone}
            onChange={(v) => updateNewClientField('phone', v)}
          />

          <FormField
            label="Adresse"
            name="address"
            type="textarea"
            value={newClientData.address}
            onChange={(v) => updateNewClientField('address', v)}
          />

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreatingClient(false)}
              disabled={createClientLoading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleCreateClient}
              disabled={createClientLoading || !newClientData.name}
              className="flex-1"
            >
              {createClientLoading ? 'Création...' : 'Créer le client'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}