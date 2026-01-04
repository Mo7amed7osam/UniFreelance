import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createTopUpRequest,
  downloadTopUpScreenshot,
  getTopUpRequests,
  getWalletBalance,
} from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';

const ClientWallet: React.FC = () => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: getWalletBalance,
  });

  const { data: topups, isLoading: topupsLoading } = useQuery({
    queryKey: ['wallet', 'topups'],
    queryFn: getTopUpRequests,
  });

  const topupMutation = useMutation({
    mutationFn: (payload: { amount: number; screenshot: File; note?: string }) => createTopUpRequest(payload),
    onSuccess: () => {
      toast.success('Top-up request submitted.');
      setAmount('');
      setNote('');
      setScreenshot(null);
      queryClient.invalidateQueries({ queryKey: ['wallet', 'topups'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit top-up request.');
    },
  });

  const handleSubmit = () => {
    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    if (!screenshot) {
      toast.error('Screenshot is required.');
      return;
    }
    topupMutation.mutate({ amount: amountValue, screenshot, note: note.trim() || undefined });
  };

  const openScreenshot = async (id: string) => {
    try {
      const blob = await downloadTopUpScreenshot(id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load screenshot.');
    }
  };

  const instapayReceiver = balanceData?.instapayReceiver || '01146370900';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-ink-400">Client wallet</p>
        <h1 className="text-2xl font-semibold text-ink-900">Wallet & top-ups</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current balance</CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className="text-3xl font-semibold">${Number(balanceData?.balance || 0).toFixed(2)}</p>
            )}
            <p className="text-sm text-ink-500">Funds held in escrow for active contracts.</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Instapay instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-600">
              Transfer the exact amount to Instapay receiver <span className="font-semibold">{instapayReceiver}</span>,
              then upload the payment screenshot.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit top-up request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700">Amount</label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={topupMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700">Screenshot</label>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                disabled={topupMutation.isPending}
              />
              {screenshot ? <p className="text-xs text-ink-500">{screenshot.name}</p> : null}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700">Note (optional)</label>
            <Textarea
              rows={3}
              placeholder="Add any reference details."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={topupMutation.isPending}
            />
          </div>
          <Button type="button" disabled={topupMutation.isPending} onClick={handleSubmit}>
            {topupMutation.isPending ? 'Submitting...' : 'Submit top-up'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top-up history</CardTitle>
        </CardHeader>
        <CardContent>
          {topupsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (topups || []).length === 0 ? (
            <p className="text-sm text-ink-500">No top-ups submitted yet.</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Submitted</TableHeaderCell>
                  <TableHeaderCell>Action</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(topups || []).map((topup: any) => (
                  <TableRow key={topup._id}>
                    <TableCell>${topup.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          topup.status === 'APPROVED'
                            ? 'success'
                            : topup.status === 'DECLINED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {topup.status}
                      </Badge>
                      {topup.status === 'DECLINED' && topup.decisionReason ? (
                        <p className="mt-1 text-xs text-rose-500">{topup.decisionReason}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {topup.createdAt ? new Date(topup.createdAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openScreenshot(topup._id)}
                      >
                        View screenshot
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientWallet;
