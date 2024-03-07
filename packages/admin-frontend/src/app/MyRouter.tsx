import { createBrowserRouter } from 'react-router-dom'
import React from 'react'
import { MainLayout } from '../core/MainLayout'
import { RouteErrorBoundary } from '@fangcha/react'
import { FavorAppsProvider, SDK_DataAppListView } from '@fangcha/datawich-react'
import { DataAppDetailView } from '../data-app/DataAppDetailView'
import { DataModelListView } from '../data-model/DataModelListView'
import { DataModelManageView } from '../data-model/DataModelManageView'
import { DatawichAdminPages } from '@web/datawich-common/admin-apis'
import { JobListView } from '@fangcha/job-react'
import { ResourceTaskListView } from '@fangcha/oss-react'
import { ModelClientListView } from '../model-client/ModelClientListView'
import { DatabaseDetailView } from '../database/DatabaseDetailView'
import { DBTableDetailView } from '../database/DBTableDetailView'
import { DBConnectionListView } from '../database/DBConnectionListView'
import { DBTableDataView } from '../database/DBTableDataView'
import { Example_FormPageView } from '@fangcha/form-react/src/example/Example_FormPageView'

export const MyRouter = createBrowserRouter([
  {
    path: '/',
    element: (
      <FavorAppsProvider>
        <MainLayout appName='Datawich 🍰' />
      </FavorAppsProvider>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: <SDK_DataAppListView />,
      },
      {
        path: DatawichAdminPages.AllDataAppsRoute,
        element: <SDK_DataAppListView />,
      },
      {
        path: DatawichAdminPages.DataAppDetailRoute,
        element: <DataAppDetailView />,
      },
      {
        path: DatawichAdminPages.ModelListRoute,
        element: <DataModelListView />,
      },
      {
        path: DatawichAdminPages.ModelDetailRoute,
        element: <DataModelManageView />,
      },
      {
        path: DatawichAdminPages.JobListRoute,
        element: <JobListView />,
      },
      {
        path: DatawichAdminPages.ResourceTaskListRoute,
        element: <ResourceTaskListView />,
      },
      {
        path: DatawichAdminPages.ClientListRoute,
        element: <ModelClientListView />,
      },
      {
        path: DatawichAdminPages.DatabaseConnectionListRoute,
        element: <DBConnectionListView />,
      },
      {
        path: DatawichAdminPages.DatabaseDetailRoute,
        element: <DatabaseDetailView />,
      },
      {
        path: DatawichAdminPages.DatabaseTableDetailRoute,
        element: <DBTableDetailView />,
      },
      {
        path: DatawichAdminPages.DatabaseTableDataRoute,
        element: <DBTableDataView />,
      },
      {
        path: '/v0/example/form',
        element: <Example_FormPageView />,
      },
      {
        path: '*',
        element: <div>404 Not Found</div>,
      },
    ],
  },
])
