import * as React from "react";
import { ChartBar, MoreHorizontal, Plus } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Avatar,
} from "~/components/ui";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "~/components/ui/pagination";
import { t } from "@/lib/i18n";

const samplePartners: Array<{ id: string; name: string; contact: string }> = [
  { id: "P-1001", name: "Laundry Co.", contact: "owner@laundry.co" },
  { id: "P-1002", name: "QuickWash", contact: "hello@quickwash.com" },
  { id: "P-1003", name: "SpinCycle", contact: "info@spincycle.io" },
  { id: "P-1004", name: "CleanHub", contact: "contact@cleanhub.vn" },
];

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

export default function PartnersPage(): React.JSX.Element {
  // partners state so we can swap in API data later
  const [partners, setPartners] = React.useState(samplePartners);

  React.useEffect(() => {
    // TODO: fetch partners from API and call setPartners(data)
  }, []);
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">{t('admin.partners.title')}</div>
            <div className="font-semibold">{partners.length}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">{t('admin.users.header.projects')}</div>
            <div className="font-semibold">--</div>
            <ChartBar className="text-gray-400" size={16} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="default" size="icon" className="mr-2">
            <Plus size={16} />
          </Button>
          <Button variant="ghost" size="sm">{t('admin.partners.table.add') || 'Add'}</Button>
        </div>
      </div>

      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          <Table className="w-full p-0">
            <TableHeader className={`${tableHeader.bg} ${tableHeader.text}`}>
              <TableRow>
                <TableHead className="rounded-tl-md">{t('admin.partners.table.partner') || 'Partner'}</TableHead>
                <TableHead>{t('admin.partners.table.contact') || 'Contact'}</TableHead>
                <TableHead className="rounded-tr-md">{t('admin.partners.table.action') || 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {partners.map((p) => (
                <TableRow key={p.id} className="h-10">
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 text-sm">{p.name[0]}</Avatar>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-muted-foreground">{p.id}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-2">{p.contact}</TableCell>

                  <TableCell className="py-2">
                    <button className="p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Footer / Pagination */}
          <div className="flex items-center justify-between  border-t border-black-200 pt-4 pl-2 pr-2 pb-2">
            <div className="flex items-center gap-4">
              <select className="border rounded px-2 py-1">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <div className="text-sm text-muted-foreground">1-10 of {partners.length}</div>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationPrevious />
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">100</PaginationLink>
                </PaginationItem>
                <PaginationNext />
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
