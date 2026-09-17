terraform {
  backend "s3" {
    bucket       = "backdoor-tfstate-2026"
    key          = "terraform.tfstate"
    region       = "ap-southeast-2"
    encrypt      = true
    use_lockfile = true
  }
}