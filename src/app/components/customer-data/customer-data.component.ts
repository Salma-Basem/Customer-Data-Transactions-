import { Component } from '@angular/core';
import { ICustomers } from 'src/app/interface/icustomers';
import { ITransactions } from 'src/app/interface/itransactions';
import { CustomersService } from 'src/app/services/customers.service';
import { TranscationsService } from 'src/app/services/transcations.service';
import { ElementRef, ViewChild } from '@angular/core';

import { Chart, ChartConfiguration, ChartData, ChartOptions } from 'chart.js/auto';
@Component({
  selector: 'app-customer-data',
  templateUrl: './customer-data.component.html',
  styleUrls: ['./customer-data.component.css']
})
export class CustomerDataComponent {
  customers: ICustomers[] = [];
  transactions: ITransactions[] = [];
  filterCustomerName: string = '';
  filterTransactionAmount: number = 0;
  selectedCustomerId: number | undefined;
  customerName: string = '';
  selectedCustomerName: string = '';  
  private chart: Chart | null = null;
  userInput2: string = '';
  selectedAction: string | null = null;

  showChart: boolean = false;

  constructor(
    private _CustomersService: CustomersService,
    private _TranscationsService: TranscationsService
  ) {}

  ngOnInit() {
    this.getCustomers();
    this.getTransactions();
    
  }

  getCustomers() {
    this._CustomersService.getCustomersData().subscribe({
      next:(response) => {this.customers = response;},
      error:(error) => {console.log(error);}
    });
  }

  getTransactions() {
    this._TranscationsService.getTransactionsData().subscribe({next:(response) => {this.transactions = response;
      this.transactions = response.sort((a: { customer_id: any; }, b: { customer_id: any; }) => {
        const idA = Number(a.customer_id);
        const idB = Number(b.customer_id); 
        return idA - idB; 
      });
    },
    error:(error) => {console.log(error);}
    });
  }
  getCustomerName(customerId: number): string {
    let customer = this.customers.find(c => c.id == customerId);
    console.log(customer)
    return customer ? customer.name : '';
  }

  get filteredTransactions(): ITransactions[] {
    return this.transactions.filter(transaction => {
      let customerName = this.getCustomerName(transaction.customer_id);
      return (
        customerName.toLowerCase().includes(this.filterCustomerName.toLowerCase()) &&
        (this.filterTransactionAmount === 0 || transaction.amount >= this.filterTransactionAmount)
      );
    });
  }
  
 showChartData(customerName: string) {
  
    const customer = this.customers.find(c => 
      c.name.toLowerCase() === customerName.toLowerCase()
    );

    if (!customer) {
      alert('Customer not found!');
      return;
    }

    this.selectedCustomerId = customer.id;
    this.customerName = customer.name;
    this.showChart=true;
    const filteredTransactions = this.transactions.filter(transaction => transaction.customer_id == this.selectedCustomerId);
    
    if (filteredTransactions.length === 0) {
      alert('No transactions found for this customer!');
      return;
    }

    const dataMap = new Map<string, number>();
    filteredTransactions.forEach(transaction => {
      const key = transaction.date;
      dataMap.set(key, (dataMap.get(key) || 0) + transaction.amount);
    });

    const labels = Array.from(dataMap.keys());
    const data = Array.from(dataMap.values());
    this.drawChart(labels, data);
  }

  private drawChart(labels: string[], data: number[]): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const chartData: ChartData<'pie'> = {
      labels: labels,
      datasets: [{
        label: `Total Amount per Day for ${this.customerName}`,
        data: data,
        backgroundColor: ['rgb(88, 138, 135)', 'rgb(191, 191, 172)', 'rgb(255, 205, 86)'],
        borderWidth: 1
      }]
    };

    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'pie',
          data: chartData,
        });
      }
    }
  }

  getGroupedTransactions() {
    const grouped = new Map<number, ITransactions[]>();

    this.filteredTransactions.forEach(transaction => {
      if (!grouped.has(transaction.customer_id)) {
        grouped.set(transaction.customer_id, []);
      }
      grouped.get(transaction.customer_id)?.push(transaction);
    });

    return Array.from(grouped.entries()).map(([customerId, transactions]) => ({
      customerId,
      transactions,
      customerName: this.getCustomerName(customerId)
    }));
  }

  showInput(action: string) {
   
    this.showChart = false;
  
    if (this.selectedAction === action) {
      this.selectedAction = null; 
      this.resetFilters(); 
    } else {
      this.selectedAction = action;
      this.resetFilters(); 
    }
  }
  
  resetFilters() {
  
    this.filterCustomerName = '';
    this.filterTransactionAmount = 0;
  }
  
  onFilterChange() {
    this.showChart = false; 
  }
  


  DisplayCustomerName(customerId: number, index: number): boolean {
    if (index === 0) return true;
    return this.filteredTransactions[index - 1].customer_id !== customerId; 
  }
  hideChart()
  {
    if (this.chart) {
      this.chart.destroy();
    }
    this.showChart = false;
  
  }
  getRowSpan(customerId: number, index: number): number {
    let count = 0;
    for (let i = index; i < this.filteredTransactions.length; i++) {
      if (this.filteredTransactions[i].customer_id === customerId) {
        count++;
      } else {
        break; 
      }
    }
    return count;
  }
  

  DisplayChartButton(customerId: number, index: number): boolean {
  return this.DisplayCustomerName(customerId, index); 
  }

}

