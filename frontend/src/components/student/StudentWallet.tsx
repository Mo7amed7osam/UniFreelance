import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createWithdrawalRequest, getWalletBalance, getWithdrawalRequests } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';

const StudentWallet: React.FC = () => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'BANK' | 'INSTAPAY'>('BANK');
  const [bankAccount, setBankAccount] = useState('');
  const [instapayHandle, setInstapayHandle] = useState('');
  const [note, setNote] = useState('');

  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: getWalletBalance,
  });

  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['wallet', 'withdrawals'],
    queryFn: getWithdrawalRequests,
  });

  const withdrawMutation = useMutation({
    mutationFn: (payload: {
      amount: number;
      bankAccount?: string;
      instapayHandle?: string;
      note?: string;
    }) => createWithdrawalRequest(payload),
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
      toast.error(error?.response?.data?.message || 'Failed to submit withdrawal request.');
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
      instapayHandle: payoutMethod === 'INSTAPAY' ? instapayHandle.trim() : undefined,
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-ink-400">Student wallet</p>
        <h1 className="text-2xl font-semibold text-ink-900">Withdraw earnings</h1>
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
            <p className="text-sm text-ink-500">Balance updates after client acceptance.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request a withdrawal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700">Amount</label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 250"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={withdrawMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700">Payout method</label>
              <Select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as 'BANK' | 'INSTAPAY')}
                disabled={withdrawMutation.isPending}
              >
                <option value="BANK">Bank account</option>
                <option value="INSTAPAY">Instapay</option>
              </Select>
            </div>
          </div>
          {payoutMethod === 'BANK' ? (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700">Bank account</label>
              <Input
                placeholder="Account number or IBAN"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                disabled={withdrawMutation.isPending}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700">Instapay handle</label>
              <Input
                placeholder="@username or phone"
                value={instapayHandle}
                onChange={(e) => setInstapayHandle(e.target.value)}
                disabled={withdrawMutation.isPending}
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700">Note (optional)</label>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={withdrawMutation.isPending}
            />
          </div>
          <Button type="button" disabled={withdrawMutation.isPending} onClick={handleSubmit}>
            {withdrawMutation.isPending ? 'Submitting...' : 'Submit withdrawal'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal history</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawalsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (withdrawals || []).length === 0 ? (
            <p className="text-sm text-ink-500">No withdrawal requests yet.</p>
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
                {(withdrawals || []).map((withdrawal: any) => (
                  <TableRow key={withdrawal._id}>
                    <TableCell>${withdrawal.amount}</TableCell>
                    <TableCell>{withdrawal.payoutMethod}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          withdrawal.status === 'APPROVED'
                            ? 'success'
                            : withdrawal.status === 'DECLINED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {withdrawal.status}
                      </Badge>
                      {withdrawal.status === 'DECLINED' && withdrawal.decisionReason ? (
                        <p className="mt-1 text-xs text-rose-500">{withdrawal.decisionReason}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleDateString() : '—'}
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
