"use client"
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
//import { Property } from '@/types/property'
import { mockProperties } from '@/data/mockProperties'

const PropertyTables = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockProperties.map((property) => (
            <TableRow key={property.id}>
              <TableCell className="font-medium">{property.title}</TableCell>
              <TableCell>{property.type}</TableCell>
              <TableCell>{property.location.address}</TableCell>
              <TableCell>₦{property.price.toLocaleString()}</TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Available
                </span>
              </TableCell>
              <TableCell>
                <button className="text-blue-600 hover:text-blue-800">Edit</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default PropertyTables