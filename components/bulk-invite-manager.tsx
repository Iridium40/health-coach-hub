"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { useToast } from "@/hooks/use-toast"
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Users,
  Mail,
  AlertTriangle,
  Trash2
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

// Default coach rank for all coaches
const DEFAULT_COACH_RANK = "IPD"

interface ParsedEntry {
  first_name: string
  last_name: string
  email: string
  isValid: boolean
  errors: string[]
  rowNumber: number
}

interface InviteResult {
  email: string
  full_name: string
  success: boolean
  error?: string
}

interface BulkInviteResponse {
  success: boolean
  summary: {
    total: number
    successful: number
    failed: number
  }
  results: InviteResult[]
}

export function BulkInviteManager() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [parsedData, setParsedData] = useState<ParsedEntry[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [results, setResults] = useState<BulkInviteResponse | null>(null)
  const [dragActive, setDragActive] = useState(false)

  /**
   * Download CSV template
   */
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/bulk-invite-template")
      if (!response.ok) throw new Error("Failed to download template")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "bulk-invite-template.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Template Downloaded",
        description: "Fill in the CSV template with coach information and upload it.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      })
    }
  }

  /**
   * Validate a single entry
   */
  const validateEntry = (entry: Omit<ParsedEntry, "isValid" | "errors" | "rowNumber">): string[] => {
    const errors: string[] = []
    
    if (!entry.first_name || entry.first_name.trim().length === 0) {
      errors.push("First name is required")
    }
    
    if (!entry.last_name || entry.last_name.trim().length === 0) {
      errors.push("Last name is required")
    }
    
    if (!entry.email || entry.email.trim().length === 0) {
      errors.push("Email is required")
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(entry.email.trim())) {
        errors.push("Invalid email format")
      }
    }
    
    return errors
  }

  /**
   * Parse CSV content
   */
  const parseCSV = (content: string): ParsedEntry[] => {
    const lines = content.split(/\r?\n/).filter(line => {
      const trimmed = line.trim()
      // Skip empty lines and comment lines
      return trimmed.length > 0 && !trimmed.startsWith("#")
    })
    
    if (lines.length < 2) {
      return []
    }
    
    // Parse header
    const headerLine = lines[0]
    const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim())
    
    const firstNameIndex = headers.findIndex(h => h === "first_name" || h === "firstname" || h === "first")
    const lastNameIndex = headers.findIndex(h => h === "last_name" || h === "lastname" || h === "last")
    const emailIndex = headers.findIndex(h => h === "email")
    
    if (firstNameIndex === -1 || lastNameIndex === -1 || emailIndex === -1) {
      toast({
        title: "Invalid CSV Format",
        description: "CSV must have columns: first_name, last_name, email",
        variant: "destructive",
      })
      return []
    }
    
    // Parse data rows
    const entries: ParsedEntry[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      
      if (values.length < 3) continue
      
      const entry = {
        first_name: values[firstNameIndex]?.trim() || "",
        last_name: values[lastNameIndex]?.trim() || "",
        email: values[emailIndex]?.trim().toLowerCase() || "",
      }
      
      const errors = validateEntry(entry)
      
      entries.push({
        ...entry,
        isValid: errors.length === 0,
        errors,
        rowNumber: i + 1
      })
    }
    
    return entries
  }

  /**
   * Parse a single CSV line handling quoted values
   */
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === "," && !inQuotes) {
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
  }

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((file: File) => {
    if (!file) return
    
    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const entries = parseCSV(content)
      setParsedData(entries)
      setResults(null)
      
      if (entries.length > 0) {
        const validCount = entries.filter(e => e.isValid).length
        toast({
          title: "CSV Parsed",
          description: `Found ${entries.length} entries (${validCount} valid, ${entries.length - validCount} with errors)`,
        })
      }
    }
    reader.readAsText(file)
  }, [toast])

  /**
   * Handle drag events
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [handleFileSelect])

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  /**
   * Clear uploaded data
   */
  const handleClear = () => {
    setParsedData([])
    setResults(null)
    setProcessingProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  /**
   * Run bulk invite process
   */
  const handleRunBulkInvite = async () => {
    const validEntries = parsedData.filter(e => e.isValid)
    
    if (validEntries.length === 0) {
      toast({
        title: "No Valid Entries",
        description: "Please fix the errors in your CSV before proceeding",
        variant: "destructive",
      })
      return
    }
    
    setIsProcessing(true)
    setProcessingProgress(0)
    setResults(null)
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 5, 90))
      }, 500)
      
      const response = await fetch("/api/bulk-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entries: validEntries.map(e => ({
            full_name: `${e.first_name} ${e.last_name}`.trim(),
            email: e.email,
            coach_rank: DEFAULT_COACH_RANK,
          }))
        }),
      })
      
      clearInterval(progressInterval)
      setProcessingProgress(100)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to process bulk invites")
      }
      
      const data: BulkInviteResponse = await response.json()
      setResults(data)
      
      toast({
        title: "Bulk Invite Complete",
        description: `Successfully sent ${data.summary.successful} invites. ${data.summary.failed} failed.`,
        variant: data.summary.failed > 0 ? "default" : "default",
      })
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process bulk invites",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const validCount = parsedData.filter(e => e.isValid).length
  const invalidCount = parsedData.length - validCount

  return (
    <div className="space-y-6">
      {/* Download Template Section */}
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-optavia-dark flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Step 1: Download Template
          </CardTitle>
          <CardDescription className="text-optavia-gray">
            Download the CSV template to get started with bulk invites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button 
              onClick={handleDownloadTemplate}
              variant="outline"
              className="border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-light))]"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
            <div className="text-sm text-optavia-gray">
              <p>Template includes columns: <code className="bg-gray-100 px-1 rounded">first_name</code>, <code className="bg-gray-100 px-1 rounded">last_name</code>, <code className="bg-gray-100 px-1 rounded">email</code></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-optavia-dark flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Step 2: Upload Filled CSV
          </CardTitle>
          <CardDescription className="text-optavia-gray">
            Upload your completed CSV file with coach information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${dragActive 
                ? "border-[hsl(var(--optavia-green))] bg-[hsl(var(--optavia-green-light))]" 
                : "border-gray-300 hover:border-[hsl(var(--optavia-green))] hover:bg-gray-50"
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-4 text-optavia-gray" />
            <p className="text-optavia-dark font-medium mb-1">
              Drop your CSV file here or click to browse
            </p>
            <p className="text-sm text-optavia-gray">
              Only .csv files are accepted (max 1,000 entries per upload)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {parsedData.length > 0 && (
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-optavia-dark flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Step 3: Review & Send
                </CardTitle>
                <CardDescription className="text-optavia-gray">
                  Review the parsed data before sending invites
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  Total: {parsedData.length}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Valid: {validCount}</span>
              </div>
              {invalidCount > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">Invalid: {invalidCount}</span>
                </div>
              )}
            </div>

            {/* Validation Errors Alert */}
            {invalidCount > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  {invalidCount} entries have errors and will be skipped. Review the table below for details.
                </AlertDescription>
              </Alert>
            )}

            {/* Data Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader className="bg-gray-50 sticky top-0">
                    <TableRow>
                      <TableHead className="w-12">Row</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((entry, index) => (
                      <TableRow 
                        key={index}
                        className={entry.isValid ? "" : "bg-red-50"}
                      >
                        <TableCell className="font-mono text-xs text-gray-500">
                          {entry.rowNumber}
                        </TableCell>
                        <TableCell>
                          {entry.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{entry.first_name || "-"}</TableCell>
                        <TableCell className="font-medium">{entry.last_name || "-"}</TableCell>
                        <TableCell className="text-sm">{entry.email || "-"}</TableCell>
                        <TableCell className="text-xs text-red-600">
                          {entry.errors.length > 0 ? entry.errors.join("; ") : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--optavia-green))]" />
                  <span className="text-sm text-optavia-gray">Processing invites...</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}

            {/* Run Button */}
            <Button
              onClick={handleRunBulkInvite}
              disabled={isProcessing || validCount === 0}
              className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Run Bulk Invite ({validCount} coaches)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {results && (
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-optavia-dark flex items-center gap-2">
              {results.summary.failed === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              Results Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-optavia-dark">{results.summary.total}</p>
                <p className="text-sm text-optavia-gray">Total Processed</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">{results.summary.successful}</p>
                <p className="text-sm text-green-600">Successful</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-700">{results.summary.failed}</p>
                <p className="text-sm text-red-600">Failed</p>
              </div>
            </div>

            {/* Detailed Results */}
            {results.results.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-auto">
                  <Table>
                    <TableHeader className="bg-gray-50 sticky top-0">
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.results.map((result, index) => (
                        <TableRow 
                          key={index}
                          className={result.success ? "bg-green-50" : "bg-red-50"}
                        >
                          <TableCell>
                            {result.success ? (
                              <Badge className="bg-green-600">Sent</Badge>
                            ) : (
                              <Badge variant="destructive">Failed</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{result.full_name}</TableCell>
                          <TableCell className="text-sm">{result.email}</TableCell>
                          <TableCell className="text-xs">
                            {result.success ? (
                              <span className="text-green-700">Invite email sent successfully</span>
                            ) : (
                              <span className="text-red-600">{result.error}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
