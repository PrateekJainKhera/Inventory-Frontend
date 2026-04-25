import React from 'react'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui'
import { Grid3X3, LayoutGrid, List, BarChart3, Check, Eye } from 'lucide-react'

interface ViewSectionProps {
  currentView: 'grid' | 'chart' | 'cards' | 'lists'
  onViewChange: (view: 'grid' | 'chart' | 'cards' | 'lists') => void
}

export function ViewSection({ currentView, onViewChange }: ViewSectionProps) {
  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Eye className="mr-2 h-4 w-4" />
          <span>View Options</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => onViewChange('grid')}>
            <Grid3X3 className="mr-2 h-4 w-4" />
            <span>Grid View</span>
            {currentView === 'grid' && <Check className="ml-auto h-4 w-4 text-[rgb(var(--color-primary))]" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewChange('cards')}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            <span>Card View</span>
            {currentView === 'cards' && <Check className="ml-auto h-4 w-4 text-[rgb(var(--color-primary))]" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewChange('lists')}>
            <List className="mr-2 h-4 w-4" />
            <span>List View</span>
            {currentView === 'lists' && <Check className="ml-auto h-4 w-4 text-[rgb(var(--color-primary))]" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewChange('chart')}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Chart View</span>
            {currentView === 'chart' && <Check className="ml-auto h-4 w-4 text-[rgb(var(--color-primary))]" />}
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  )
}
