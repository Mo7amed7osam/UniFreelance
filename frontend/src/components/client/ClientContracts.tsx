import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getContracts } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table';

const ClientContracts: React.FC = () => {
  const navigate = useNavigate();

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['contracts', 'client'],
    queryFn: () => getContracts(),
  });

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
          Client Workspace
        </p>
        <h1 className="text-3xl font-semibold text-ink-900 dark:text-white">
          Active{' '}
          <span className="text-brand-600 dark:text-brand-400">
            contracts
          </span>
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Track ongoing and completed engagements.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (contracts || []).length === 0 ? (
        <Card className="border-dashed dark:bg-ink-800 dark:border-ink-700">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-ink-500 dark:text-ink-400">
              No contracts yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card
          className="
            bg-white/80 backdrop-blur-sm transition-all
            hover:shadow-xl
            dark:bg-ink-800 dark:border-ink-700
          "
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ink-900 dark:text-white">
              Active engagements
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Job</TableHeaderCell>
                  <TableHeaderCell>Student</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Budget</TableHeaderCell>
                  <TableHeaderCell>Action</TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(contracts || []).map((contract: any) => (
                  <TableRow
                    key={contract._id}
                    className="transition-colors hover:bg-brand-50/40 dark:hover:bg-ink-800"
                  >
                    <TableCell className="font-medium">
                      {contract.jobId?.title || 'Job'}
                    </TableCell>

                    <TableCell>
                      {contract.studentId?.name || 'Student'}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          contract.status === 'completed'
                            ? 'success'
                            : 'brand'
                        }
                      >
                        {contract.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-medium">
                      ${contract.agreedBudget}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/contracts/${contract._id}`)
                        }
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

export default ClientContracts;
