import { useState } from 'react';
import { Package, AlertTriangle, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

// Mock data
const inventoryItems = [
  {
    id: 1,
    name: 'All-Purpose Cleaner',
    category: 'Cleaning Supplies',
    quantity: 45,
    unit: 'bottles',
    reorderThreshold: 20,
    vendor: 'CleanCo Supplies',
    cost: 12.99,
    lastRestocked: new Date('2025-11-15'),
  },
  {
    id: 2,
    name: 'Microfiber Cloths',
    category: 'Equipment',
    quantity: 12,
    unit: 'packs',
    reorderThreshold: 15,
    vendor: 'ProClean Equipment',
    cost: 24.99,
    lastRestocked: new Date('2025-11-10'),
  },
  {
    id: 3,
    name: 'Disinfectant Spray',
    category: 'Cleaning Supplies',
    quantity: 8,
    unit: 'bottles',
    reorderThreshold: 10,
    vendor: 'CleanCo Supplies',
    cost: 15.99,
    lastRestocked: new Date('2025-11-05'),
  },
  {
    id: 4,
    name: 'Vacuum Bags',
    category: 'Equipment',
    quantity: 32,
    unit: 'boxes',
    reorderThreshold: 15,
    vendor: 'ProClean Equipment',
    cost: 18.50,
    lastRestocked: new Date('2025-11-12'),
  },
  {
    id: 5,
    name: 'Glass Cleaner',
    category: 'Cleaning Supplies',
    quantity: 28,
    unit: 'bottles',
    reorderThreshold: 20,
    vendor: 'CleanCo Supplies',
    cost: 9.99,
    lastRestocked: new Date('2025-11-18'),
  },
  {
    id: 6,
    name: 'Mop Heads',
    category: 'Equipment',
    quantity: 6,
    unit: 'pieces',
    reorderThreshold: 10,
    vendor: 'ProClean Equipment',
    cost: 14.99,
    lastRestocked: new Date('2025-11-08'),
  },
];

export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventoryItems.filter(item => item.quantity < item.reorderThreshold);
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Inventory Management</h1>
          <p className="text-neutral-600 mt-1">Track and manage cleaning supplies</p>
        </div>
        <Button className="bg-secondary-500 hover:bg-secondary-600">
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
          <div className="text-2xl font-bold text-neutral-900 mb-1">2</div>
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

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
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
                      <span className="font-semibold text-neutral-900">${item.cost.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-neutral-600">
                        {item.lastRestocked.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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

      {/* Restock Form */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Restock</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Item" />
            </SelectTrigger>
            <SelectContent>
              {inventoryItems.map(item => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input type="number" placeholder="Quantity" min="1" />
          
          <Input type="number" placeholder="Cost per unit" step="0.01" min="0" />
          
          <Button className="bg-secondary-500 hover:bg-secondary-600">
            Add Stock
          </Button>
        </div>
      </div>
    </div>
  );
}
