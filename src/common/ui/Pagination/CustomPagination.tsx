import React from 'react';
import { Pagination } from './Pagination';

type CustomPaginationProps = React.ComponentProps<typeof Pagination>;

const CustomPagination: React.FC<CustomPaginationProps> = (props) => (
  <Pagination
    {...props}
    style={{
      marginTop: 16,
      display: 'flex',
      justifyContent: 'center',
      ...(props.style || {})
    }}
  />
);

export default CustomPagination;
