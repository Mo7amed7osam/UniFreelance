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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table';
import useAuth from '@/hooks/useAuth';

const ClientWallet: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?._id;

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet', 'balance', userId],
    queryFn: getWalletBalance,
    enabled: !!userId,
  });

  const { data: topups, isLoading: topupsLoading } = useQuery({
    queryKey: ['wallet', 'topups', userId],
    queryFn: getTopUpRequests,
    enabled: !!userId,
  });

  const topupMutation = useMutation({
    mutationFn: (payload: { amount: number; screenshot: File; note?: string }) =>
      createTopUpRequest(payload),
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
    topupMutation.mutate({
      amount: amountValue,
      screenshot,
      note: note.trim() || undefined,
    });
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
    <div
      className="
        space-y-10 rounded-2xl p-6
        bg-gradient-to-br from-ink-50 via-white to-brand-100/30
        dark:bg-gradient-to-br dark:from-ink-900 dark:via-ink-900 dark:to-ink-800
      "
    >
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-400">
          Client Wallet
        </p>
        <h1 className="text-3xl font-semibold text-ink-900 dark:text-white">
          Wallet &{' '}
          <span className="text-brand-600 dark:text-brand-400">
            top-ups
          </span>
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Manage your balance and funding requests.
        </p>
      </div>

      {/* Balance & Instructions */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Balance */}
        <Card
          className="
            bg-gradient-to-br from-brand-500 to-brand-700 text-white
            transition-all hover:-translate-y-1 hover:shadow-xl
          "
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Current balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {balanceLoading ? (
              <Skeleton className="h-8 w-24 bg-white/30" />
            ) : (
              <p className="text-4xl font-semibold text-white">
                ${Number(balanceData?.balance || 0).toFixed(2)}
              </p>
            )}
            <p className="text-sm text-white/80">
              Funds held in escrow for contracts.
            </p>
          </CardContent>
        </Card>

        {/* Instapay */}
        <Card
          className="
            md:col-span-2
            bg-white/80 backdrop-blur-sm transition-all
            hover:shadow-xl
            dark:bg-ink-800 dark:border-ink-700
          "
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ink-900 dark:text-white">
              Instapay instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-600 dark:text-ink-400">
              Transfer the exact amount to Instapay receiver{' '}
              <span className="font-semibold text-ink-900 dark:text-white">
                {instapayReceiver}
              </span>
              , then upload the payment screenshot.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top-up Form */}
      <Card
        className="
          bg-white/80 backdrop-blur-sm transition-all
          hover:shadow-xl
          dark:bg-ink-800 dark:border-ink-700
        "
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ink-900 dark:text-white">
            Submit top-up request
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                Amount
              </label>
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
              <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                Screenshot
              </label>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                disabled={topupMutation.isPending}
              />
              {screenshot && (
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  {screenshot.name}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
              Note (optional)
            </label>
            <Textarea
              rows={3}
              placeholder="Add any reference details."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={topupMutation.isPending}
            />
          </div>

          <Button
            type="button"
            disabled={topupMutation.isPending}
            onClick={handleSubmit}
          >
            {topupMutation.isPending ? 'Submitting…' : 'Submit top-up'}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <Card
        className="
          bg-white/80 backdrop-blur-sm transition-all
          hover:shadow-xl
          dark:bg-ink-800 dark:border-ink-700
        "
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ink-900 dark:text-white">
            Top-up history
          </CardTitle>
        </CardHeader>

        <CardContent>
          {topupsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (topups || []).length === 0 ? (
            <p className="text-sm text-ink-500 dark:text-ink-400">
              No top-ups submitted yet.
            </p>
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
                  <TableRow
                    key={topup._id}
                    className="transition-colors hover:bg-brand-50/40 dark:hover:bg-ink-800"
                  >
                    <TableCell className="font-medium">
                      ${topup.amount}
                    </TableCell>

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

                      {topup.status === 'DECLINED' && topup.decisionReason && (
                        <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">
                          {topup.decisionReason}
                        </p>
                      )}
                    </TableCell>

                    <TableCell>
                      {topup.createdAt
                        ? new Date(topup.createdAt).toLocaleDateString()
                        : '—'}
                    </TableCell>

                    <TableCell>
                      <Button
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
