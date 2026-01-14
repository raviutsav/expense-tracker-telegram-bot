import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const TransactionsTable = ({ expenses, onUpdate, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter((expense) => {
      const query = searchQuery.toLowerCase();
      return (
        expense.category?.toLowerCase().includes(query) ||
        expense.description?.toLowerCase().includes(query) ||
        expense.amount?.toString().includes(query)
      );
    });
  }, [expenses, searchQuery]);

  const sortedExpenses = useMemo(() => {
    if (!filteredExpenses) return [];
    const sorted = [...filteredExpenses];
    sorted.sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.key) {
        case 'date':
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
          break;
        case 'amount':
          // Sort by signed value (Debit is negative, Credit is positive)
          aVal = (a.type === 'debit' ? -1 : 1) * Number(a.amount);
          bVal = (b.type === 'debit' ? -1 : 1) * Number(b.amount);
          break;
        case 'category':
          aVal = (a.category || '').toLowerCase();
          bVal = (b.category || '').toLowerCase();
          break;
        case 'merchant':
          aVal = (a.description || '').toLowerCase();
          bVal = (b.description || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredExpenses, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = sortedExpenses.slice(startIndex, endIndex);

  // Reset to page 1 when search or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortButton = ({ columnKey, children }) => {
    const isActive = sortConfig.key === columnKey;
    return (
      <button
        onClick={() => handleSort(columnKey)}
        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
      >
        {children}
        {isActive ? (
          sortConfig.direction === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    );
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setEditData({
      category: expense.category || '',
      amount: expense.amount,
      type: expense.type,
      description: expense.description || '',
    });
  };

  const handleSave = async () => {
    try {
      await onUpdate(editingId, editData);
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  if (!expenses || expenses.length === 0) {
    return (
      <Card className="border-border shadow-sm bg-card">
        <CardContent className="p-12">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">No transactions found</p>
            <p className="mt-1 text-xs text-muted-foreground">Start adding expenses to see them here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Transactions</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 border-input bg-background/50 text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-12 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <SortButton columnKey="date">Date</SortButton>
                </TableHead>
                <TableHead className="h-12 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <SortButton columnKey="merchant">Merchant</SortButton>
                </TableHead>
                <TableHead className="h-12 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <SortButton columnKey="category">Category</SortButton>
                </TableHead>
                <TableHead className="h-12 px-6 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-1.5">
                    <SortButton columnKey="amount">Amount</SortButton>
                  </div>
                </TableHead>
                <TableHead className="h-12 px-6 w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedExpenses.map((expense) => {
                const isEditing = editingId === expense.id;
                return (
                  <TableRow
                    key={expense.id}
                    className="border-border hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      {expense.created_at_readable ||
                        format(new Date(expense.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {isEditing ? (
                        <Input
                          value={editData.description}
                          onChange={(e) =>
                            setEditData({ ...editData, description: e.target.value })
                          }
                          className="h-9 text-sm border-input bg-background"
                        />
                      ) : (
                        <span className="text-sm font-medium text-foreground">
                          {expense.description || '-'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {isEditing ? (
                        <Input
                          value={editData.category}
                          onChange={(e) =>
                            setEditData({ ...editData, category: e.target.value })
                          }
                          className="h-9 text-sm border-input bg-background"
                        />
                      ) : (
                        <span className="text-sm font-medium text-foreground">
                          {expense.category || 'Uncategorized'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editData.amount}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              amount: parseFloat(e.target.value),
                            })
                          }
                          className="h-9 text-sm text-right border-input bg-background"
                        />
                      ) : (
                        <span
                          className={`text-sm font-semibold ${expense.type === 'credit'
                            ? 'text-emerald-600'
                            : 'text-foreground'
                            }`}
                        >
                          {expense.type === 'credit' ? '+' : '-'}₹
                          {expense.amount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleSave}
                            className="h-8 px-3 text-xs"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            className="h-8 px-3 text-xs border-input"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(expense)}
                            className="h-8 w-8 p-0 hover:bg-muted"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(expense.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Pagination */}
      {sortedExpenses.length > 0 && (
        <div className="border-t border-border px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-muted-foreground">entries</span>
              </div>
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedExpenses.length)} of{' '}
                {sortedExpenses.length} transactions
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 px-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="h-9 w-9 px-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 px-3"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TransactionsTable;
