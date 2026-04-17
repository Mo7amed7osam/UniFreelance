import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createWithdrawalRequest,
  getWalletBalance,
  getWithdrawalRequests,
} from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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

const StudentWallet: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?._id;

  const [amount, setAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'BANK' | 'INSTAPAY'>('BANK');
  const [bankAccount, setBankAccount] = useState('');
  const [instapayHandle, setInstapayHandle] = useState('');
  const [note, setNote] = useState('');

  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet', 'balance', userId],
    queryFn: getWalletBalance,
    enabled: !!userId,
  });

  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['wallet', 'withdrawals', userId],
    queryFn: getWithdrawalRequests,
    enabled: !!userId,
  });

  const withdrawMutation = useMutation({
    mutationFn: createWithdrawalRequest,
    onSuccess: () => {
      toast.success('Withdrawal request submitted.');
      setAmount('');
      setBankAccount('');
      setInstapayHandle('');
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['wallet', 'withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to submit withdrawal request.'
      );
    },
  });

  const handleSubmit = () => {
    const amountValue = Number(amount);
    const balance = Number(balanceData?.balance || 0);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    if (amountValue > balance) {
      toast.error('Withdrawal amount exceeds balance.');
      return;
    }
    if (payoutMethod === 'BANK' && !bankAccount.trim()) {
      toast.error('Bank account is required.');
      return;
    }
    if (payoutMethod === 'INSTAPAY' && !instapayHandle.trim()) {
      toast.error('Instapay handle is required.');
      return;
    }

    withdrawMutation.mutate({
      amount: amountValue,
      bankAccount: payoutMethod === 'BANK' ? bankAccount.trim() : undefined,
      instapayHandle:
        payoutMethod === 'INSTAPAY'
          ? instapayHandle.trim()
          : undefined,
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">
          Student wallet
        </p>
        <h1 className="text-3xl font-semibold dark:text-white">
          Withdraw earnings
        </h1>
        <p className="max-w-xl text-sm text-ink-500">
          Request payouts securely using your preferred method.
        </p>
      </div>

      <Card className="relative overflow-hidden">
        {/* <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 to-brand-700" /> */}
        <CardHeader>
          <CardTitle>Current balance</CardTitle>
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p className="text-4xl font-semibold text-ink-900">
              ${Number(balanceData?.balance || 0).toFixed(2)}
            </p>
          )}
          <p className="mt-1 text-sm text-ink-500">
            Balance updates after client acceptance.
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        {/* <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 to-brand-700" /> */}
        <CardHeader>
          <CardTitle>Request a withdrawal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700">
                Amount
              </label>
              <Input
                type="number"
                placeholder="e.g. 250"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={withdrawMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700">
                Payout method
              </label>
              <Select
                value={payoutMethod}
                onChange={(e) =>
                  setPayoutMethod(
                    e.target.value as 'BANK' | 'INSTAPAY'
                  )
                }
                disabled={withdrawMutation.isPending}
              >
                <option value="BANK">Bank account</option>
                <option value="INSTAPAY">Instapay</option>
              </Select>
            </div>
          </div>

          {payoutMethod === 'BANK' ? (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700">
                Bank account
              </label>
              <Input
                placeholder="Account number or IBAN"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                disabled={withdrawMutation.isPending}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700">
                Instapay handle
              </label>
              <Input
                placeholder="@username or phone"
                value={instapayHandle}
                onChange={(e) =>
                  setInstapayHandle(e.target.value)
                }
                disabled={withdrawMutation.isPending}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700">
              Note (optional)
            </label>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={withdrawMutation.isPending}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={withdrawMutation.isPending}
            className="bg-gradient-to-r from-brand-600 to-brand-700"
          >
            {withdrawMutation.isPending
              ? 'Submitting...'
              : 'Submit withdrawal'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal history</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawalsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (withdrawals || []).length === 0 ? (
            <p className="text-sm text-ink-500">
              No withdrawal requests yet.
            </p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Method</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Submitted</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(withdrawals || []).map((w: any) => (
                  <TableRow
                    key={w._id}
                    className="hover:bg-ink-50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      ${w.amount}
                    </TableCell>
                    <TableCell>{w.payoutMethod}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          w.status === 'APPROVED'
                            ? 'success'
                            : w.status === 'DECLINED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {w.status}
                      </Badge>
                      {w.status === 'DECLINED' &&
                        w.decisionReason && (
                          <p className="mt-1 text-xs text-rose-500">
                            {w.decisionReason}
                          </p>
                        )}
                    </TableCell>
                    <TableCell>
                      {w.createdAt
                        ? new Date(
                            w.createdAt
                          ).toLocaleDateString()
                        : '—'}
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

export default StudentWallet;
