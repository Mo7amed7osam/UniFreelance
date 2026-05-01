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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table';

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
  });

  const declineTopupMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      declineAdminTopUp(id, { reason }),
    onSuccess: () => {
      toast.success('Top-up declined.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'topups'] });
    },
  });

  const approveWithdrawalMutation = useMutation({
    mutationFn: (id: string) => approveAdminWithdrawal(id),
    onSuccess: () => {
      toast.success('Withdrawal approved.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'withdrawals'] });
    },
  });

  const declineWithdrawalMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      declineAdminWithdrawal(id, { reason }),
    onSuccess: () => {
      toast.success('Withdrawal declined.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'withdrawals'] });
    },
  });

  const openScreenshot = async (id: string) => {
    try {
      const blob = await downloadTopUpScreenshot(id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error('Failed to load screenshot.');
    }
  };

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
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">
          Admin Payments
        </p>
        <h1 className="text-3xl font-semibold text-ink-900 dark:text-white">
          Payments{' '}
          <span className="text-brand-600 dark:text-brand-400">
            management
          </span>
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Review and control top-ups and withdrawals.
        </p>
      </div>

      {/* Tabs + Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={activeTab === 'topups' ? 'default' : 'outline'}
          onClick={() => setActiveTab('topups')}
        >
          Top-ups
        </Button>

        <Button
          variant={activeTab === 'withdrawals' ? 'default' : 'outline'}
          onClick={() => setActiveTab('withdrawals')}
        >
          Withdrawals
        </Button>

        <div className="ml-auto w-[200px]">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="DECLINED">Declined</option>
          </Select>
        </div>
      </div>

      {/* TABLE CARD */}
      <Card className="bg-white/80 backdrop-blur-sm dark:bg-ink-800 dark:border-ink-700">
        <CardHeader>
          <CardTitle className="text-lg text-ink-900 dark:text-white">
            {activeTab === 'topups' ? 'Top-up requests' : 'Withdrawal requests'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {(activeTab === 'topups' ? topupsLoading : withdrawalsLoading) ? (
            <Skeleton className="h-40 w-full" />
          ) : (activeTab === 'topups'
              ? (topups || []).length === 0
              : (withdrawals || []).length === 0) ? (
            <p className="text-sm text-ink-500 dark:text-ink-400">
              No requests found.
            </p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>
                    {activeTab === 'topups' ? 'Client' : 'Student'}
                  </TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  {activeTab === 'withdrawals' && (
                    <TableHeaderCell>Method</TableHeaderCell>
                  )}
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(activeTab === 'topups' ? topups : withdrawals)?.map((item: any) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="font-semibold text-ink-900 dark:text-white">
                        {(item.clientId || item.studentId)?.name}
                      </div>
                      <p className="text-xs text-ink-500 dark:text-ink-400">
                        {(item.clientId || item.studentId)?.email}
                      </p>
                    </TableCell>

                    <TableCell className="font-medium">
                      ${item.amount}
                    </TableCell>

                    {activeTab === 'withdrawals' && (
                      <TableCell className="text-sm text-ink-600 dark:text-ink-300">
                        {item.payoutMethod}
                      </TableCell>
                    )}

                    <TableCell>
                      <Badge
                        variant={
                          item.status === 'APPROVED'
                            ? 'success'
                            : item.status === 'DECLINED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        {activeTab === 'topups' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openScreenshot(item._id)}
                          >
                            Screenshot
                          </Button>
                        )}

                        {item.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                activeTab === 'topups'
                                  ? approveTopupMutation.mutate(item._id)
                                  : approveWithdrawalMutation.mutate(item._id)
                              }
                            >
                              Approve
                            </Button>

                            <Textarea
                              rows={2}
                              placeholder="Decline reason"
                              value={declineReasons[item._id] || ''}
                              onChange={(e) =>
                                setDeclineReasons((prev) => ({
                                  ...prev,
                                  [item._id]: e.target.value,
                                }))
                              }
                            />

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                activeTab === 'topups'
                                  ? declineTopupMutation.mutate({
                                      id: item._id,
                                      reason: declineReasons[item._id],
                                    })
                                  : declineWithdrawalMutation.mutate({
                                      id: item._id,
                                      reason: declineReasons[item._id],
                                    })
                              }
                            >
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
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

export default AdminPayments;