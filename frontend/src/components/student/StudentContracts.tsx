import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import { getContracts, getStudentProfile } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';

const StudentContracts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['contracts', 'student'],
    queryFn: () => getContracts(),
  });

  const { data: profile } = useQuery({
    queryKey: ['student', 'profile', userId],
    queryFn: () => getStudentProfile(userId),
    enabled: !!userId,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-ink-400">Student workspace</p>
          <h1 className="text-2xl font-semibold text-ink-900">My contracts</h1>
        </div>
        <Card className="w-full md:w-auto">
          <CardContent className="py-3">
            <p className="text-xs text-ink-500">Balance</p>
            <p className="text-lg font-semibold text-ink-900">${profile?.balance?.toFixed?.(2) || '0.00'}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (contracts || []).length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-ink-500">No contracts yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Active engagements</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Job</TableHeaderCell>
                  <TableHeaderCell>Client</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Budget</TableHeaderCell>
                  <TableHeaderCell>Action</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(contracts || []).map((contract: any) => (
                  <TableRow key={contract._id}>
                    <TableCell>{contract.jobId?.title || 'Job'}</TableCell>
                    <TableCell>{contract.clientId?.name || 'Client'}</TableCell>
                    <TableCell>
                      <Badge variant={contract.status === 'completed' ? 'success' : 'brand'}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${contract.agreedBudget}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/contracts/${contract._id}`)}
                      >
                        View contract
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentContracts;
