---
title: "From Concept to Practice: Unleashing Terraform's Power 🚀"
description: "Exploring Terraform's journey at INTERSPORT to revolutionize operations."
categories: ["post", "Blog"]
tags:
  ["Terraform", "SystemAdministration", "InfrastructureAsCode", "INTERSPORT"]
showSummary: true
publishDate: 08. March 2024
---

:::note[Migrated Post]
The post you are currently reading has been migrated from my previous site.

It was originally published under the URL
`https://beisel.intersport.page/posts/terraform/`
:::

As System Administrators at INTERSPORT, we're at the forefront of exploring Infrastructure as Code (IaC) with Terraform. While it's still early days, our journey into integrating Terraform presents an opportunity to reshape our approach to infrastructure management. This exploration is a testament to our commitment to innovation, underscoring how we are actively revolutionizing our operational capabilities. Here, we detail our initial foray into Terraform, highlighting the technical frameworks and the real-world deployment that marks our first significant step towards this transformation.

## Terraform: The Building Blocks

Our venture into Terraform is guided by its core components, offering us a glimpse into the future of efficient and agile operations.

- **Providers:**
  Terraform providers have enabled us to interface seamlessly with essential services, such as vsphere for VM management and bitwarden for secure credential handling.

- **Resources and Data Sources:**
  Form the core of our Terraform configurations, representing infrastructure elements. We dynamically fetch data center and VM template details with data sources and define resources for our VMs, ensuring that configurations are both scalable and repeatable.

- **Variables, Outputs, and State:**
  Offer customization, information retrieval, and state tracking. By parameterizing our configurations, not only can we reuse our code, but we also gain visibility into our infrastructure’s state and output critical information for operational excellence.

## A practical example

In this example we will be looking into, we've structured our Terraform setup with a focus on three key providers: `bitwarden`, `random`, and `vsphere`, to manage credentials securely, generate random passwords, and orchestrate our virtual environment, respectively. This multi-provider strategy ensures that we can handle different aspects of our infrastructure seamlessly.

    terraform {
        required_providers {
            bitwarden = { source = "maxlaverse/bitwarden", version = "0.7.2" }
            random = { source  = "hashicorp/random", version = "~> 3.0" }
            vsphere = { source  = "hashicorp/vsphere", version = "2.6.1" }
        }
    }

Our vsphere configuration is tailored to connect securely to our vCenter, leveraging a combination of Terraform variables (ie: `var.vsphere_server`) and environment variables for sensitive values like `VSPHERE_USER` and `VSPHERE_PASSWORD`. Similarly, the `bitwarden` provider is configured to enhance security and flexibility in managing credentials and generating secure, random passwords for our VMs.

The essence of our Terraform use case involves deploying two Windows Server 2022 virtual machines (`IDEHENSV0331` and `IDEHENSV0332`) within our specified infrastructure parameters, including custom network settings and security configurations managed through Bitwarden.

Each VM deployment is carefully customized, from CPU and memory specifications inherited from a template, to network interfaces and disk configurations. To fill in the required values we use a variety of data sources (`vsphere_datacenter`, `vsphere_compute_cluster`, ...)

    data "vsphere_datacenter" "dc" {
        name = var.vsphere_datacenter # INTERSPORT
    }

After we have those information at our disposal we can pull it all together and use the information in conjunction with the `vsphere_virtual_machine` ressource to orchestrate the deployments of our 2 VMs (only one is pictured below):

    resource "vsphere_virtual_machine" "vm1" {
        name = "IDEHENSV0331"
        resource_pool_id = data.vsphere_compute_cluster.cluster.resource_pool_id
        datastore_id = data.vsphere_datastore.ds.id

        num_cpus = data.vsphere_virtual_machine.template.num_cpus
        num_cores_per_socket = data.vsphere_virtual_machine.template.num_cores_per_socket
        memory = data.vsphere_virtual_machine.template.memory

        guest_id = data.vsphere_virtual_machine.template.guest_id

        firmware  = data.vsphere_virtual_machine.template.firmware
        scsi_type = data.vsphere_virtual_machine.template.scsi_type

        folder = var.vm_folder # /Einzelapplikationen

        network_interface {
            network_id = var.vm_network
        }

        dynamic "disk" {
            for_each = data.vsphere_virtual_machine.template.disks
            content {
            label      = disk.value.label
            size       = disk.value.size
            unit_number = disk.value.unit_number
            }
        }

            clone {
                template_uuid = data.vsphere_virtual_machine.template.id

                customize {
                    windows_options {
                    computer_name  = "IDEHENSV0331"
                    admin_password = random_password.IDEHENSV0331.result
                    #join_domain
                    time_zone = data.vsphere_virtual_machine.template.windows_options.time_zone
                    }

                    network_interface {
                    ipv4_address = "10.128.4.237"
                    ipv4_netmask = "23"

                    }

                    ipv4_gateway = "10.128.4.1"
                }
            }
    }

Moreover, we use the random_password resources to automatically generate and manage robust passwords.

    resource "random_password" "IDEHENSV0331" {
        length = 16
        special = true
        override_special = "_%@"
    }

By adopting this methodology, we not only guarantee the scalability and manageability of our infrastructure but also uphold stringent security protocols. This is achieved through the codification of our internal guidelines, ensuring secure credential management and adherence to best practices in security.

This journey underscores our commitment at INTERSPORT to leveraging cutting-edge technologies to enhance our operational efficiencies. As we continue to explore its capabilities, Terraform is showing great promise. It offers a way to bridge traditional operations with modern efficiencies, signaling its potential to significantly streamline operations in traditional settings.

## Reflecting on Challenges and Opportunities

As we navigate through the complexities of this new terrain, the learning curve has been steep. Our initial deployment has unveiled both the potential and the challenges of integrating Terraform into our existing systems. It's a journey of continuous learning, adjustment, and anticipation of how Terraform can streamline our operations in the long term.

## The Road Ahead: Terraform's Place at INTERSPORT

Our exploration into Terraform is just beginning. While it has not yet revolutionized our operations, the potential is undeniable. This first deployment is a crucial step towards understanding how Terraform can fit within our broader strategy to modernize and enhance operational efficiency. We're optimistic about the future and eager to look deeper into the capabilities of Terraform as we consider making it a staple in our environment.

## Conclusion

Our pilot project with Terraform at INTERSPORT signifies more than just a trial; it represents a forward-thinking approach to infrastructure management. By sharing our initial experiences, we aim to offer insights into the real-world application of Terraform, set against the backdrop of our ongoing evaluation. As we continue to assess its impact and refine our approach, Terraform stands as a promising candidate for ushering in a new era of operational excellence at INTERSPORT.
