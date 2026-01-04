import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  approveAdminTopUp,
  approveAdminWithdrawal,
  declineAdminTopUp,
  declineAdminWithdrawal,
  downloadTopUpScreenshot,
  getAdminTopUps,
  getAdminWithdrawals,
} from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';

const AdminPayments: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'topups' | 'withdrawals'>('topups');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [declineReasons, setDeclineReasons] = useState<Record<string, string>>({});

  const { data: topups, isLoading: topupsLoading } = useQuery({
    queryKey: ['admin', 'payments', 'topups', statusFilter],
    queryFn: () => getAdminTopUps(statusFilter),
    enabled: activeTab === 'topups',
  });

  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['admin', 'payments', 'withdrawals', statusFilter],
    queryFn: () => getAdminWithdrawals(statusFilter),
    enabled: activeTab === 'withdrawals',
  });

  const approveTopupMutation = useMutation({
    mutationFn: (id: string) => approveAdminTopUp(id),
    onSuccess: () => {
      toast.success('Top-up approved.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'topups'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to approve top-up.');
    },
  });

  const declineTopupMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => declineAdminTopUp(id, { reason }),
    onSuccess: () => {
      toast.success('Top-up declined.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'topups'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to decline top-up.');
    },
  });

  const approveWithdrawalMutation = useMutation({
    mutationFn: (id: string) => approveAdminWithdrawal(id),
    onSuccess: () => {
      toast.success('Withdrawal approved.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'withdrawals'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to approve withdrawal.');
    },
  });

  const declineWithdrawalMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => declineAdminWithdrawal(id, { reason }),
    onSuccess: () => {
      toast.success('Withdrawal declined.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'withdrawals'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to decline withdrawal.');
    },
  });

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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-ink-400">Admin workspace</p>
        <h1 className="text-2xl font-semibold text-ink-900">Payments</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={activeTab === 'topups' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('topups')}
        >
          Top-ups
        </Button>
        <Button
          type="button"
          variant={activeTab === 'withdrawals' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('withdrawals')}
        >
          Withdrawals
        </Button>
        <div className="ml-auto">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="DECLINED">Declined</option>
          </Select>
        </div>
      </div>

      {activeTab === 'topups' ? (
        <Card>
          <CardHeader>
            <CardTitle>Top-up requests</CardTitle>
          </CardHeader>
          <CardContent>
            {topupsLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (topups || []).length === 0 ? (
              <p className="text-sm text-ink-500">No top-up requests found.</p>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Client</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Submitted</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(topups || []).map((topup: any) => (
                    <TableRow key={topup._id}>
                      <TableCell>
                        <div className="font-semibold text-ink-900">{topup.clientId?.name || 'Client'}</div>
                        <p className="text-xs text-ink-500">{topup.clientId?.email || '—'}</p>
                        {topup.note ? <p className="mt-1 text-xs text-ink-500">Note: {topup.note}</p> : null}
                      </TableCell>
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
                      </TableCell>
                      <TableCell>
                        {topup.createdAt ? new Date(topup.createdAt).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Button type="button" size="sm" variant="ghost" onClick={() => openScreenshot(topup._id)}>
                            View screenshot
                          </Button>
                          {topup.status === 'PENDING' ? (
                            <div className="space-y-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (window.confirm('Approve this top-up request?')) {
                                    approveTopupMutation.mutate(topup._id);
                                  }
                                }}
                                disabled={approveTopupMutation.isPending}
                              >
                                Approve
                              </Button>
                              <Textarea
                                rows={2}
                                placeholder="Decline reason (optional)"
                                value={declineReasons[topup._id] || ''}
                                onChange={(e) =>
                                  setDeclineReasons((prev) => ({ ...prev, [topup._id]: e.target.value }))
                                }
                                disabled={declineTopupMutation.isPending}
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  declineTopupMutation.mutate({
                                    id: topup._id,
                                    reason: declineReasons[topup._id],
                                  })
                                }
                                disabled={declineTopupMutation.isPending}
                              >
                                Decline
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal requests</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawalsLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (withdrawals || []).length === 0 ? (
              <p className="text-sm text-ink-500">No withdrawal requests found.</p>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Student</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Method</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(withdrawals || []).map((withdrawal: any) => (
                    <TableRow key={withdrawal._id}>
                      <TableCell>
                        <div className="font-semibold text-ink-900">{withdrawal.studentId?.name || 'Student'}</div>
                        <p className="text-xs text-ink-500">{withdrawal.studentId?.email || '—'}</p>
                      </TableCell>
                      <TableCell>${withdrawal.amount}</TableCell>
                      <TableCell>
                        <div className="text-sm text-ink-900">{withdrawal.payoutMethod}</div>
                        <p className="text-xs text-ink-500">
                          {withdrawal.payoutMethod === 'BANK'
                            ? withdrawal.bankAccount || '—'
                            : withdrawal.instapayHandle || '—'}
                        </p>
                      </TableCell>
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
                      </TableCell>
                      <TableCell>
                        {withdrawal.status === 'PENDING' ? (
                          <div className="space-y-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (window.confirm('Approve this withdrawal request?')) {
                                  approveWithdrawalMutation.mutate(withdrawal._id);
                                }
                              }}
                              disabled={approveWithdrawalMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Textarea
                              rows={2}
                              placeholder="Decline reason (optional)"
                              value={declineReasons[withdrawal._id] || ''}
                              onChange={(e) =>
                                setDeclineReasons((prev) => ({ ...prev, [withdrawal._id]: e.target.value }))
                              }
                              disabled={declineWithdrawalMutation.isPending}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                declineWithdrawalMutation.mutate({
                                  id: withdrawal._id,
                                  reason: declineReasons[withdrawal._id],
                                })
                              }
                              disabled={declineWithdrawalMutation.isPending}
                            >
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs text-ink-500">
                            {withdrawal.decisionReason || 'Processed'}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPayments;
