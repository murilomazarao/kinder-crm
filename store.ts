import { create } from 'zustand';
import { Customer, KanbanStatus, Product, FieldDefinition, KanbanColumnDefinition, Tag, Invoice, ImportantContact } from './types';
import { supabase } from './supabaseClient';

interface AppState {
  customers: Customer[];
  products: Product[];
  fieldDefinitions: FieldDefinition[];
  columns: KanbanColumnDefinition[];
  tags: Tag[];
  invoices: Invoice[];
  importantContacts: ImportantContact[];
  user: any | null;
  profile: { id: string, full_name?: string, avatar_url?: string, role?: string } | null;
  allProfiles: any[];
  authResolved: boolean;
  setUser: (user: any | null) => void;
  setAuthResolved: (resolved: boolean) => void;
  setProfile: (profile: any | null) => void;
  fetchProfile: (uid: string) => Promise<void>;
  fetchAllProfiles: () => Promise<void>;
  signOut: () => Promise<void>;
  darkMode: boolean;
  isLoading: boolean;
  toggleDarkMode: () => void;

  // Actions
  fetchData: () => Promise<void>;
  moveCustomer: (customerId: string, newStatus: string) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  addCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  addProduct: (product: Product) => Promise<{ error: any }>;
  addFieldDefinition: (field: FieldDefinition) => Promise<void>;
  deleteFieldDefinition: (fieldId: string) => Promise<void>;
  addTag: (tag: Tag) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (invoiceId: string) => Promise<void>;
  addImportantContact: (contact: ImportantContact) => Promise<void>;
  updateImportantContact: (contact: ImportantContact) => Promise<void>;
  deleteImportantContact: (contactId: string) => Promise<void>;

  // Column Actions
  addColumn: (column: KanbanColumnDefinition) => Promise<void>;
  updateColumn: (column: KanbanColumnDefinition) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  updateProduct: (product: Product) => Promise<{ error: any }>;
  deleteProduct: (productId: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  customers: [],
  products: [],
  fieldDefinitions: [],
  columns: [],
  tags: [],
  invoices: [],
  importantContacts: [],
  darkMode: true,
  isLoading: false,
  user: null,
  profile: null,
  allProfiles: [],
  authResolved: false,

  setUser: (user) => set({ user }),
  setAuthResolved: (resolved) => set({ authResolved: resolved }),
  setProfile: (profile) => set({ profile }),

  fetchProfile: async (uid) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (!error) set({ profile: data });
  },

  fetchAllProfiles: async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error) set({ allProfiles: data || [] });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  fetchData: async () => {
    const { customers, columns } = get();
    // Only show loading state if we don't have essential data yet
    if (customers.length === 0 || columns.length === 0) {
      set({ isLoading: true });
    }

    try {
      const [
        { data: columnsData, error: columnsError },
        { data: customersData, error: customersError },
        { data: productsData, error: productsError },
        { data: fieldsData, error: fieldsError },
        { data: tagsData, error: tagsError },
        { data: invoicesData, error: invoicesError },
        { data: contactsData, error: contactsError }
      ] = await Promise.all([
        supabase.from('kanban_columns').select('*').order('order', { ascending: true }),
        supabase.from('customers').select('*'),
        supabase.from('products').select('*'),
        supabase.from('field_definitions').select('*'),
        supabase.from('tags').select('*'),
        supabase.from('invoices').select('*').order('date', { ascending: false }),
        supabase.from('important_contacts').select('*').order('created_at', { ascending: false })
      ]);

      if (columnsError) console.error('Error fetching columns:', columnsError);
      if (customersError) console.error('Error fetching customers:', customersError);
      if (productsError) console.error('Error fetching products:', productsError);
      if (fieldsError) console.error('Error fetching fields:', fieldsError);
      if (tagsError) console.error('Error fetching tags:', tagsError);
      if (invoicesError) console.error('Error fetching invoices:', invoicesError);
      if (contactsError) console.error('Error fetching contacts:', contactsError);

      const formattedCustomers: Customer[] = (customersData || []).map((c: any) => ({
        ...c,
        lastContact: c.last_contact,
        customFields: c.custom_fields,
        createdAt: c.created_at || new Date().toISOString(),
        tags: c.tags || [],
        status: c.status as any,
        saleOrigin: c.sale_origin,
        carrier: c.carrier,
        quoteNumber: c.quote_number,
      }));

      set({
        columns: (columnsData as KanbanColumnDefinition[]) || [],
        customers: formattedCustomers,
        products: (productsData || []).map((p: any) => ({
          ...p,
          supplierPrice: p.supplier_price,
          salePrice: p.sale_price,
          purchasePrice: p.purchase_price,
          images: p.images || (p.image ? [p.image] : []),
        })) as Product[],
        fieldDefinitions: (fieldsData as FieldDefinition[]) || [],
        tags: (tagsData as Tag[]) || [],
        invoices: (invoicesData || []).map((i: any) => ({
          id: i.id,
          title: i.title,
          value: i.value,
          type: i.type,
          category: i.category || 'invoice',
          date: i.date,
          fileUrl: i.file_url,
          customerId: i.customer_id,
          createdAt: i.created_at
        })),
        importantContacts: (contactsData || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          company: c.company,
          category: c.category,
          createdAt: c.created_at
        })),
        isLoading: false,
      });
    } catch (error) {
      console.error('Fatal error in fetchData:', error);
      set({ isLoading: false });
    }
  },

  moveCustomer: async (customerId, newStatus) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId ? { ...c, status: newStatus as any } : c
      ),
    }));
    await supabase.from('customers').update({ status: newStatus }).eq('id', customerId);
  },

  addCustomer: async (customer) => {
    const clientStatuses: KanbanStatus[] = ['sale', 'shipped', 'delivered'];
    const isClient = clientStatuses.includes(customer.status as KanbanStatus);
    const newCustomer = { ...customer, isClient };
    set((state) => ({ customers: [...state.customers, newCustomer] }));
    await supabase.from('customers').insert({
      id: newCustomer.id,
      name: newCustomer.name,
      company: newCustomer.company,
      email: newCustomer.email,
      phone: newCustomer.phone,
      status: newCustomer.status,
      value: newCustomer.value,
      last_contact: newCustomer.lastContact,
      priority: newCustomer.priority,
      products: newCustomer.products,
      custom_fields: newCustomer.customFields,
      created_at: newCustomer.createdAt,
      tags: newCustomer.tags,
      discount: newCustomer.discount,
      freight: newCustomer.freight,
      is_client: newCustomer.isClient,
      sale_origin: newCustomer.saleOrigin,
      carrier: newCustomer.carrier,
      quote_number: newCustomer.quoteNumber
    });
  },

  updateCustomer: async (updatedCustomer) => {
    set((state) => {
      const customer = state.customers.find((c) => c.id === updatedCustomer.id);
      if (!customer) return state;
      let isClient = customer.isClient;
      if (updatedCustomer.status) {
        const clientStatuses: KanbanStatus[] = ['sale', 'shipped', 'delivered'];
        if (clientStatuses.includes(updatedCustomer.status as KanbanStatus)) isClient = true;
      }
      const finalCustomer = { ...customer, ...updatedCustomer, isClient };
      supabase.from('customers').update({
        name: finalCustomer.name,
        company: finalCustomer.company,
        email: finalCustomer.email,
        phone: finalCustomer.phone,
        status: finalCustomer.status,
        value: finalCustomer.value,
        last_contact: finalCustomer.lastContact,
        priority: finalCustomer.priority,
        products: finalCustomer.products,
        custom_fields: finalCustomer.customFields,
        tags: finalCustomer.tags,
        discount: finalCustomer.discount,
        freight: finalCustomer.freight,
        is_client: finalCustomer.isClient,
        sale_origin: finalCustomer.saleOrigin,
        carrier: finalCustomer.carrier,
        quote_number: finalCustomer.quoteNumber
      }).eq('id', finalCustomer.id).then(({ error }) => {
        if (error) console.error('Error updating customer:', error);
      });
      return {
        customers: state.customers.map((c) => (c.id === finalCustomer.id ? finalCustomer : c)),
      };
    });
  },

  deleteCustomer: async (customerId) => {
    set((state) => ({ customers: state.customers.filter((c) => c.id !== customerId) }));
    await supabase.from('customers').delete().eq('id', customerId);
  },

  addProduct: async (product) => {
    set((state) => ({ products: [...state.products, product] }));
    const { error } = await supabase.from('products').insert({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      supplier_price: product.supplierPrice,
      sale_price: product.salePrice,
      purchase_price: product.purchasePrice,
      stock: product.stock,
      category: product.category,
      images: product.images
    });
    return { error };
  },

  addFieldDefinition: async (field) => {
    set((state) => ({ fieldDefinitions: [...state.fieldDefinitions, field] }));
    await supabase.from('field_definitions').insert(field);
  },

  deleteFieldDefinition: async (fieldId) => {
    set((state) => ({ fieldDefinitions: state.fieldDefinitions.filter((f) => f.id !== fieldId) }));
    await supabase.from('field_definitions').delete().eq('id', fieldId);
  },

  addTag: async (tag) => {
    set((state) => ({ tags: [...state.tags, tag] }));
    await supabase.from('tags').insert(tag);
  },

  deleteTag: async (tagId) => {
    set((state) => ({ tags: state.tags.filter((t) => t.id !== tagId) }));
    await supabase.from('tags').delete().eq('id', tagId);
  },

  addColumn: async (column) => {
    set((state) => ({ columns: [...state.columns, column] }));
    await supabase.from('kanban_columns').insert(column);
  },

  updateColumn: async (column) => {
    set((state) => ({ columns: state.columns.map((c) => (c.id === column.id ? column : c)) }));
    await supabase.from('kanban_columns').update(column).eq('id', column.id);
  },

  deleteColumn: async (columnId) => {
    set((state) => ({ columns: state.columns.filter((c) => c.id !== columnId) }));
    await supabase.from('kanban_columns').delete().eq('id', columnId);
  },

  updateProduct: async (product) => {
    set((state) => ({ products: state.products.map((p) => (p.id === product.id ? product : p)) }));
    const { error } = await supabase.from('products').update({
      name: product.name,
      sku: product.sku,
      price: product.price,
      supplier_price: product.supplierPrice,
      sale_price: product.salePrice,
      purchase_price: product.purchasePrice,
      stock: product.stock,
      category: product.category,
      images: product.images
    }).eq('id', product.id);
    return { error };
  },

  deleteProduct: async (productId) => {
    set((state) => ({ products: state.products.filter((p) => p.id !== productId) }));
    await supabase.from('products').delete().eq('id', productId);
  },

  addInvoice: async (invoice) => {
    set((state) => ({ invoices: [...state.invoices, invoice] }));
    await supabase.from('invoices').insert({
      id: invoice.id,
      title: invoice.title,
      value: invoice.value,
      type: invoice.type,
      category: invoice.category,
      date: invoice.date,
      file_url: invoice.fileUrl,
      customer_id: invoice.customerId,
      created_at: invoice.createdAt
    });
  },

  updateInvoice: async (invoice) => {
    set((state) => ({ invoices: state.invoices.map((i) => (i.id === invoice.id ? invoice : i)) }));
    await supabase.from('invoices').update({
      title: invoice.title,
      value: invoice.value,
      type: invoice.type,
      category: invoice.category,
      date: invoice.date,
      file_url: invoice.fileUrl,
      customer_id: invoice.customerId
    }).eq('id', invoice.id);
  },

  deleteInvoice: async (invoiceId) => {
    set((state) => ({ invoices: state.invoices.filter((i) => i.id !== invoiceId) }));
    await supabase.from('invoices').delete().eq('id', invoiceId);
  },

  addImportantContact: async (contact) => {
    set((state) => ({ importantContacts: [contact, ...state.importantContacts] }));
    await supabase.from('important_contacts').insert({
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      company: contact.company,
      category: contact.category,
      created_at: contact.createdAt
    });
  },

  updateImportantContact: async (contact) => {
    set((state) => ({
      importantContacts: state.importantContacts.map((c) => (c.id === contact.id ? contact : c)),
    }));
    await supabase.from('important_contacts').update({
      name: contact.name,
      phone: contact.phone,
      company: contact.company,
      category: contact.category
    }).eq('id', contact.id);
  },

  deleteImportantContact: async (contactId) => {
    set((state) => ({
      importantContacts: state.importantContacts.filter((c) => c.id !== contactId),
    }));
    await supabase.from('important_contacts').delete().eq('id', contactId);
  },
}));
