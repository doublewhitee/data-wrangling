import React from 'react';
import DataGrid, { TextEditor, SelectColumn } from 'react-data-grid';

const columns = [
  SelectColumn,
  { key: ' ', name: '', width: 10, },
  { key: 'id', name: 'ID', editor: TextEditor, },
  { key: 'title', name: 'Title', editor: TextEditor, headerRenderer: (p: any) => (
    <div>Title</div>
  ) }
];

const rows = [
  { " ": 1, id: 0, title: 'A' },
  { " ": 2, id: 1, title: 'B' },
  { " ": 3, id: 2, title: 'C' },
  { " ": 4, id: 3, title: 'D' },
  { " ": 5, id: 4, title: 'E' },
  { " ": 6, id: 5, title: 'F' },
];

const Table: React.FC = () => {
  return (
    <div>
      <DataGrid columns={columns} rows={rows} style={{ height: '100%' }} rowKeyGetter={(row) => row.id} />
    </div>
  );
};

export default Table;