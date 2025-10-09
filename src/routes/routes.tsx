import { lazy } from 'react';
import { RouteObject } from 'react-router';
import { DashboardLayout } from 'components/DashboardLayout';

const Login = lazy(() => import('features/auth/pages'));
const Geoportal = lazy(() => import('pages/Geoportal'));
const Formulas = lazy(() => import('pages/Formulas'));
const Objects = lazy(() => import('pages/Objects'));
const ObjectDetail = lazy(() => import('pages/ObjectDetail'));
const TechnicalConditions = lazy(() => import('features/technical-conditions'));
const AddTuForms = lazy(() => import('pages/AddTuForms'));
const ExportData = lazy(() => import('pages/ExportData'));
const ExportDataHistory = lazy(() => import('pages/ExportDataHistory'));
const Customers = lazy(() => import('pages/Customers'));
const CustomerDetails = lazy(() => import('pages/CustomerDetails'));
const EditCustomer = lazy(() => import('pages/EditCustomer'));
const TuDetails = lazy(() => import('pages/TuDetails'));
const HistoryOfLoads = lazy(() => import('pages/HistoryOfLoads'));
const Architecture = lazy(() => import('pages/Architecture'));
const ArchitectureDetails = lazy(() => import('pages/ArchitectureDetails'));
const FolderDetail = lazy(() => import('pages/FolderDetail'));
const ProtocolDetail = lazy(() => import('pages/ProtocolDetail'));
const AddCustomer = lazy(() => import('pages/AddCustomer'));
const Applications = lazy(() => import('pages/Applications'));
const NotFound = lazy(() => import('pages/NotFound'));
const ApplicationsCreate = lazy(() => import('pages/ApplicationsCreate'));
const ApplicationDetails = lazy(() => import('pages/ApplicationDetails'));
const EditApplication = lazy(() => import('pages/EditApplication'));
const Profile = lazy(() => import('pages/Profile'));
const ChangeHistory = lazy(() => import('pages/ChangeHistory'));
const ChangeApplicationHistory = lazy(() => import('pages/ChangeApplicationHistory'));
const ChangeCustomerHistory = lazy(() => import('pages/ChangeCustomerHistory'));
const ChangeObjectHistory = lazy(() => import('pages/ChangeObjectHistory'));
const Notifications = lazy(() => import('pages/Notification'));
const TyImport = lazy(() => import('pages/TyImport'));
const Invoices = lazy(() => import('pages/Invoices'));
const Protocols = lazy(() => import('pages/Protocols'));

export const routerConfig: RouteObject[] = [
  {
    path: '/',
    element: <Login />,
    index: true
  },
  {
    path: '/dashboard/geo',
    element: <Geoportal title='dashboard.pages.geoportal' />
  },
  {
    path: '/dashboard/formulas',
    element: <Formulas title='dashboard.pages.formulas' />
  },
  {
    path: '/dashboard/objects',
    element: <Objects title='dashboard.pages.objects' />
  },
  {
    path: '/dashboard/objects/:id',
    element: <ObjectDetail />
  },
  {
    path: '/dashboard/objects/:id/change-history',
    element: <ChangeObjectHistory title='routers.changeHistory' />
  },
  {
    path: '/dashboard/technical-conditions',
    element: <TechnicalConditions />
  },
  {
    path: '/dashboard/technical-conditions/tu-details/:id',
    element: <TuDetails title='routers.tuNumberPrefix' />
  },
  {
    path: '/dashboard/technical-conditions/history-of-loads/:id',
    element: <HistoryOfLoads title='routers.historyOfLoads' />
  },
  {
    path: '/dashboard/archive',
    element: (
      <DashboardLayout title='dashboard.pages.archive'>
        <TyImport />
      </DashboardLayout>
    )
  },
  {
    path: '/dashboard/add-tu-forms/:tyId',
    element: <AddTuForms title='routers.addTu' />
  },
  {
    path: '/dashboard/export-data',
    element: <ExportData title='routers.exportData' />
  },
  {
    path: '/dashboard/export-data/history',
    element: <ExportDataHistory title='routers.historyExportData' />
  },
  {
    path: '/dashboard/customers',
    element: <Customers title='dashboard.pages.customers' />
  },
  {
    path: '/dashboard/customers/:customerId',
    element: <CustomerDetails title='routers.customerDetails' />
  },
  {
    path: '/dashboard/customers/:customerId/edit',
    element: <EditCustomer title='routers.editRequister' />
  },
  {
    path: '/dashboard/customers/:customerId/change-history',
    element: <ChangeCustomerHistory title='routers.changeHistory' />
  },
  {
    path: '/dashboard/add-customer',
    element: <AddCustomer title='routers.addCustomer' />
  },
  {
    path: '/dashboard/architecture',
    element: <Architecture title='dashboard.pages.architecture' />
  },
  {
    path: '/dashboard/architecture/details/:id',
    element: <ArchitectureDetails title='routers.document' />
  },
  {
    path: '/dashboard/folder-detail/:folderId/:tyId',
    element: <FolderDetail title='routers.protocol' />
  },
  {
    path: '/dashboard/protocol-details/:id',
    element: <ProtocolDetail title='routers.protocol' />
  },
  {
    path: '/dashboard/applications',
    element: <Applications title='dashboard.pages.applications' />
  },
  {
    path: '/dashboard/applications/:id',
    element: <ApplicationDetails title='routers.applicationDetails' />
  },
  {
    path: '/dashboard/applications/:id/edit',
    element: <EditApplication title='routers.editApplication' />
  },
  {
    path: '/dashboard/applications/create',
    element: <ApplicationsCreate title='routers.applicationCreate' />
  },
  {
    path: '/dashboard/Profile',
    element: <Profile title='routers.profile' />
  },
  {
    path: '/dashboard/ty/:tyId/change-history',
    element: <ChangeHistory title='routers.changeHistory' />
  },
  {
    path: '/dashboard/applications/:id/change-history',
    element: <ChangeApplicationHistory title='routers.changeHistory' />
  },
  {
    path: '/dashboard/notifications',
    element: <Notifications title='routers.notifications' />
  },
  {
    path: '/dashboard/protocols',
    element: <Protocols title='routers.protocols' />
  },
  {
    path: '/dashboard/invoices',
    element: <Invoices title='routers.invoices' />
  },
  {
    path: '*',
    element: <NotFound />
  }
];
