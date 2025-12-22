import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Label } from "../../ui/label";

export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Cleaning Supplies',
    quantity: '',
    unit: 'bottles',
    reorderThreshold: '',
    vendor: '',
    cost: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/inventory');
      const data = await response.json();
      if (response.ok) {
        setInventoryItems(data);
      }
    } catch (error) {
      console.error('Fetch inventory error:', error);
      toast.error('Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        toast.success('Item added successfully');
        setIsAddModalOpen(false);
        setNewItem({
          name: '',
          category: 'Cleaning Supplies',
          quantity: '',
          unit: 'bottles',
          reorderThreshold: '',
          vendor: '',
          cost: ''
        });
        fetchInventory();
      } else {
        toast.error('Failed to add item');
      }
    } catch (error) {
      console.error('Add item error:', error);
      toast.error('An error occurred while adding the item');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      const response = await fetch(`/api/inventory/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (response.ok) {
        toast.success('Item updated successfully');
        setIsEditModalOpen(false);
        setEditingItem(null);
        fetchInventory();
      } else {
        toast.error('Failed to update item');
      }
    } catch (error) {
      console.error('Update item error:', error);
      toast.error('An error occurred while updating the item');
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/inventory/${itemToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Item deleted successfully');
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
        fetchInventory();
      } else {
        toast.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Delete item error:', error);
      toast.error('An error occurred while deleting the item');
    }
  };

  const openEditModal = (item: any) => {
    setEditingItem({
      ...item,
      quantity: item.quantity.toString(),
      reorderThreshold: item.reorderThreshold.toString(),
      cost: item.cost.toString()
    });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventoryItems.filter(item => item.quantity < item.reorderThreshold);
  const totalValue = inventoryItems.reduce((sum, item) => sum + Number(item.cost), 0);
  const categories = Array.from(new Set(inventoryItems.map(item => item.category)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Inventory Management</h1>
          <p className="text-neutral-600 mt-1">Track and manage cleaning supplies</p>
        </div>
        <Button 
          className="bg-secondary-500 hover:bg-secondary-600"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-secondary-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mb-1">{inventoryItems.length}</div>
          <div className="text-sm text-neutral-600">Total Items</div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600 mb-1">{lowStockItems.length}</div>
          <div className="text-sm text-neutral-600">Low Stock</div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-neutral-900 mb-1">${totalValue.toFixed(2)}</div>
          <div className="text-sm text-neutral-600">Total Value</div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-neutral-900 mb-1">{categories.length}</div>
          <div className="text-sm text-neutral-600">Categories</div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">Low Stock Alert</h3>
              <p className="text-sm text-orange-800 mb-3">
                {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below reorder threshold:
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map(item => (
                  <Badge key={item.id} variant="outline" className="border-orange-500 text-orange-700">
                    {item.name} ({item.quantity} {item.unit})
                  </Badge>
                ))}
              </div>
            </div>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              Reorder All
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={(val: string) => setCategoryFilter(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat as string} value={cat as string}>{cat as string}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="good">Good Stock</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="w-full">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Item Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Category</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Quantity</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Reorder At</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Vendor</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Cost</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Last Restocked</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredItems.map((item) => {
                const isLowStock = item.quantity < item.reorderThreshold;
                return (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-secondary-500" />
                        </div>
                        <span className="font-medium text-neutral-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="secondary">{item.category}</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isLowStock ? 'text-orange-600' : 'text-neutral-900'}`}>
                          {item.quantity}
                        </span>
                        <span className="text-sm text-neutral-600">{item.unit}</span>
                        {isLowStock && (
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-neutral-900">{item.reorderThreshold} {item.unit}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-neutral-900">{item.vendor}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-neutral-900">${Number(item.cost).toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-neutral-600">
                        {new Date(item.lastRestocked).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openDeleteDialog(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          Restock
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a new cleaning supply or equipment to the inventory tracking system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                placeholder="e.g. Glass Cleaner"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newItem.category} 
                  onValueChange={(val: string) => setNewItem({ ...newItem, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Uniforms">Uniforms</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  placeholder="Supplier name"
                  value={newItem.vendor}
                  onChange={(e) => setNewItem({ ...newItem, vendor: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  placeholder="bottles"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Reorder Threshold (Alert at)</Label>
              <Input
                id="threshold"
                type="number"
                value={newItem.reorderThreshold}
                onChange={(e) => setNewItem({ ...newItem, reorderThreshold: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button 
              className="bg-secondary-500 hover:bg-secondary-600"
              onClick={handleAddItem}
              disabled={!newItem.name || !newItem.quantity || !newItem.cost}
            >
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the details for this inventory item.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Item Name</Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={editingItem.category} 
                    onValueChange={(val: string) => setEditingItem({ ...editingItem, category: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Uniforms">Uniforms</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-vendor">Vendor</Label>
                  <Input
                    id="edit-vendor"
                    value={editingItem.vendor}
                    onChange={(e) => setEditingItem({ ...editingItem, vendor: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Input
                    id="edit-unit"
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cost">Cost ($)</Label>
                  <Input
                    id="edit-cost"
                    type="number"
                    step="0.01"
                    value={editingItem.cost}
                    onChange={(e) => setEditingItem({ ...editingItem, cost: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-threshold">Reorder Threshold</Label>
                <Input
                  id="edit-threshold"
                  type="number"
                  value={editingItem.reorderThreshold}
                  onChange={(e) => setEditingItem({ ...editingItem, reorderThreshold: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button 
              className="bg-secondary-500 hover:bg-secondary-600"
              onClick={handleUpdateItem}
              disabled={!editingItem?.name || !editingItem?.quantity || !editingItem?.cost}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteItem}
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
