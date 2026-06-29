import Root from "./table.svelte";
import Header from "./table-header.svelte";
import Body from "./table-body.svelte";
import Footer from "./table-footer.svelte";
import Row from "./table-row.svelte";
import Head from "./table-head.svelte";
import Cell from "./table-cell.svelte";
import Caption from "./table-caption.svelte";
import { tableVariants, type TableDensity } from "./table.svelte";

export { Root, Header, Body, Footer, Row, Head, Cell, Caption, tableVariants, type TableDensity };

export const Table = {
	Root,
	Header,
	Body,
	Footer,
	Row,
	Head,
	Cell,
	Caption
};
